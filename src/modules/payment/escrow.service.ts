import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import { Escrow, EscrowStatus } from './model/escrow.model';
import { Vendor } from '../vendor/model/vendor.model';
import { Order } from '../orders/model/order.model';
import { paystackConfig } from 'src/config/paystack.config';

const DEFAULT_COMMISSION_RATE = 10;

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @InjectModel(Escrow.name) private readonly escrowModel: Model<Escrow>,
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectQueue('payouts') private readonly payoutQueue: Queue,
  ) {}

  async registerPaystackRecipient(vendorId: string, bankCode?: string): Promise<string | null> {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor) throw new NotFoundException(`Vendor ${vendorId} not found`);

    if (vendor.payoutRecipientCode) {
      return vendor.payoutRecipientCode;
    }

    if (!vendor.bankAccountNumber || !(bankCode || vendor.bankName)) {
      this.logger.warn(`Vendor ${vendorId} missing bank details for Paystack recipient creation`);
      return null;
    }

    const response = await axios.post(
      `${paystackConfig.baseUrl}/transferrecipient`,
      {
        type: 'nuban',
        name: vendor.storeName,
        account_number: vendor.bankAccountNumber,
        bank_code: bankCode || vendor.bankName,
        currency: vendor.currency || 'NGN',
      },
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
        },
      },
    );

    const recipientCode: string = response.data?.data?.recipient_code;
    if (recipientCode) {
      await this.vendorModel.updateOne(
        { _id: vendor._id },
        { $set: { payoutRecipientCode: recipientCode } },
      );
    }
    return recipientCode ?? null;
  }

  async holdOrderFunds(
    orders: Array<{ _id: any; vendor: any; totalPrice: number }>,
    paymentReference: string,
    currency: string = 'NGN',
  ): Promise<Escrow[]> {
    const created: Escrow[] = [];

    for (const order of orders) {
      const existing = await this.escrowModel.findOne({ order: order._id });
      if (existing) {
        created.push(existing);
        continue;
      }

      const vendor = await this.vendorModel.findById(order.vendor).lean();
      const commissionRate = vendor?.commissionRate ?? DEFAULT_COMMISSION_RATE;
      const grossAmount = Number(order.totalPrice || 0);
      const platformFee = Number(((grossAmount * commissionRate) / 100).toFixed(2));
      const netVendorAmount = Number((grossAmount - platformFee).toFixed(2));

      const escrow = await this.escrowModel.create({
        order: order._id,
        vendor: order.vendor,
        paymentReference,
        grossAmount,
        commissionRate,
        platformFee,
        netVendorAmount,
        currency,
        status: EscrowStatus.HELD,
      });
      created.push(escrow);
    }

    return created;
  }

  async queueVendorPayout(orderId: string): Promise<{ msg: string; escrow: Escrow }> {
    const escrow = await this.escrowModel.findOne({ order: orderId });
    if (!escrow) {
      throw new NotFoundException(`No escrow record found for order ${orderId}`);
    }
    if (escrow.status === EscrowStatus.PAID_OUT) {
      throw new BadRequestException('Escrow funds have already been paid out');
    }

    escrow.status = EscrowStatus.RELEASE_QUEUED;
    await escrow.save();

    await this.payoutQueue.add(
      'disburse-vendor-payout',
      { escrowId: String(escrow._id) },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true },
    );

    return { msg: 'Vendor payout queued for disbursement', escrow };
  }

  async processPayout(escrowId: string): Promise<Escrow> {
    const escrow = await this.escrowModel.findById(escrowId);
    if (!escrow) throw new NotFoundException(`Escrow ${escrowId} not found`);

    if (escrow.status === EscrowStatus.PAID_OUT) return escrow;

    const vendor = await this.vendorModel.findById(escrow.vendor);
    if (!vendor?.payoutRecipientCode) {
      escrow.failureReason = 'Vendor has no Paystack payoutRecipientCode';
      await escrow.save();
      throw new BadRequestException(escrow.failureReason);
    }

    const transferReference = `payout_${escrow._id}_${Date.now()}`;
    const response = await axios.post(
      `${paystackConfig.baseUrl}/transfer`,
      {
        source: 'balance',
        amount: Math.round(escrow.netVendorAmount * 100),
        recipient: vendor.payoutRecipientCode,
        reason: `Payout for order ${escrow.order}`,
        reference: transferReference,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
        },
      },
    );

    escrow.status = EscrowStatus.PAID_OUT;
    escrow.transferCode = response.data?.data?.transfer_code;
    escrow.transferReference = transferReference;
    escrow.releasedAt = new Date();
    escrow.failureReason = undefined;
    await escrow.save();

    return escrow;
  }

  async getVendorEscrowSummary(vendorId: string) {
    const vendorObjectId = new Types.ObjectId(vendorId);
    const [totals, records] = await Promise.all([
      this.escrowModel.aggregate([
        { $match: { vendor: vendorObjectId } },
        {
          $group: {
            _id: '$status',
            totalNet: { $sum: '$netVendorAmount' },
            totalFees: { $sum: '$platformFee' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.escrowModel
        .find({ vendor: vendorObjectId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    return {
      msg: 'Vendor escrow summary fetched',
      summary: totals,
      records,
    };
  }
}
