import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import axios from 'axios';
import { PaymentService } from './payment.service';
import { Payment, PaymentStatus } from './model/payment.model';
import { Order, OrderStatus } from '../orders/model/order.model';
import { Product } from '../product/model/product.model';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentModel: any;
  let orderModel: any;
  let productModel: any;
  let session: any;

  beforeEach(async () => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    paymentModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    orderModel = {
      find: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    productModel = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getModelToken(Payment.name), useValue: paymentModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(Product.name), useValue: productModel },
        {
          provide: getConnectionToken(),
          useValue: { startSession: jest.fn().mockResolvedValue(session) },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('queries orders by orderIds and decrements stock for each item on verifyPayment', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          status: 'success',
          channel: 'card',
          currency: 'NGN',
          authorization: {},
          transaction_date: new Date().toISOString(),
          metadata: { orderIds: ['order-1'] },
        },
      },
    });

    paymentModel.findOne.mockReturnValue({
      session: jest.fn().mockResolvedValue({ status: PaymentStatus.PENDING }),
    });

    orderModel.find.mockReturnValue({
      session: jest.fn().mockResolvedValue([
        {
          _id: 'order-1',
          items: [{ product: 'prod-1', quantity: 2 }],
        },
      ]),
    });

    const result = await service.verifyPayment('ref-123');

    expect(result.msg).toBe('Payment verified successfully');
    expect(productModel.updateOne).toHaveBeenCalledWith(
      { _id: 'prod-1', inStock: { $gte: 2 } },
      { $inc: { inStock: -2 } },
      { session },
    );
    expect(orderModel.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['order-1'] } },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: OrderStatus.COMPLETED,
          isPaid: true,
        }),
      }),
      { session },
    );
    expect(session.commitTransaction).toHaveBeenCalled();
  });

  it('is idempotent when payment is already marked successful', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { status: 'success', metadata: { orderIds: ['order-1'] } } },
    });

    paymentModel.findOne.mockReturnValue({
      session: jest.fn().mockResolvedValue({ status: PaymentStatus.SUCCESSFUL }),
    });

    const result = await service.verifyPayment('ref-123');
    expect(result.msg).toBe('Payment already verified');
    expect(productModel.updateOne).not.toHaveBeenCalled();
  });
});
