import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bullmq';
import axios from 'axios';
import { EscrowService } from './escrow.service';
import { Escrow, EscrowStatus } from './model/escrow.model';
import { Vendor } from '../vendor/model/vendor.model';
import { Order } from '../orders/model/order.model';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EscrowService', () => {
  let service: EscrowService;
  let escrowModel: any;
  let vendorModel: any;
  let payoutQueue: any;

  beforeEach(async () => {
    escrowModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    vendorModel = {
      findById: jest.fn(),
      updateOne: jest.fn(),
    };

    payoutQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowService,
        { provide: getModelToken(Escrow.name), useValue: escrowModel },
        { provide: getModelToken(Vendor.name), useValue: vendorModel },
        { provide: getModelToken(Order.name), useValue: {} },
        { provide: getQueueToken('payouts'), useValue: payoutQueue },
      ],
    }).compile();

    service = module.get<EscrowService>(EscrowService);
  });

  it('computes commission and holds vendor funds in escrow', async () => {
    escrowModel.findOne.mockResolvedValue(null);
    vendorModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ commissionRate: 12 }),
    });
    escrowModel.create.mockImplementation(async (doc: any) => doc);

    const held = await service.holdOrderFunds(
      [{ _id: 'order-1', vendor: 'vendor-1', totalPrice: 1000 }],
      'pay-ref-1',
      'NGN',
    );

    expect(held[0]).toMatchObject({
      grossAmount: 1000,
      commissionRate: 12,
      platformFee: 120,
      netVendorAmount: 880,
      status: EscrowStatus.HELD,
    });
  });

  it('queues payout and disburses via Paystack transfer', async () => {
    const escrowDoc = {
      _id: 'escrow-1',
      order: 'order-1',
      vendor: 'vendor-1',
      netVendorAmount: 880,
      status: EscrowStatus.HELD,
      save: jest.fn().mockResolvedValue(true),
    };

    escrowModel.findOne.mockResolvedValue(escrowDoc);
    await service.queueVendorPayout('order-1');
    expect(escrowDoc.status).toBe(EscrowStatus.RELEASE_QUEUED);
    expect(payoutQueue.add).toHaveBeenCalledWith(
      'disburse-vendor-payout',
      { escrowId: 'escrow-1' },
      expect.any(Object),
    );

    escrowModel.findById.mockResolvedValue(escrowDoc);
    vendorModel.findById.mockResolvedValue({ payoutRecipientCode: 'RCP_123' });
    mockedAxios.post.mockResolvedValue({
      data: { data: { transfer_code: 'TRF_999' } },
    });

    const paid = await service.processPayout('escrow-1');
    expect(paid.status).toBe(EscrowStatus.PAID_OUT);
    expect(paid.transferCode).toBe('TRF_999');
  });
});
