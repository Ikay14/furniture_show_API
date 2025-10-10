import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment,PaymentStatus } from './model/payment.model'
import { Model, Types } from 'mongoose';
import { Order, OrderStatus } from '../orders/model/order.model';
import { PaymentDTO } from './DTO/payment.dto';
import { paystackConfig } from 'src/config/paystack.config';
import { generateTxRef } from 'src/utils/generate.txref';
import axios from 'axios';


@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async initializePayment(paymentData: PaymentDTO) {
  const { orderIds, amount, email, customerId } = paymentData;

  // Generate transaction reference
  const txRef = generateTxRef();

  // Create payment record
  const payment = await this.paymentModel.create({
    txRef,
    email,
    amount,
    orderIds, 
    paymentDate: new Date(),
    customerId,
    status: PaymentStatus.INITIATED,
  }) 

  try {
    // Call Paystack initialize
    const response = await axios.post(
      `${paystackConfig.baseUrl}/transaction/initialize`,
      {
        txRef,
        amount, // Paystack expects kobo
        email,
        metadata: {
          orderIds,
          customerId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
        },
      },
    );


    const { reference, authorization_url } = response.data.data;

    // Update payment record
    await this.paymentModel.updateOne(
      { _id: payment._id },
      { reference, status: PaymentStatus.PENDING },
    );

    return {
      msg: 'Payment initialized',
      reference,
      authorization_url,
      txRef,
    };
  } catch (error) {
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
}


    async verifyPayment(reference: string) {
    const response = await axios.get(
    `${paystackConfig.baseUrl}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
      },
    },
  );

  const data = response.data.data;

  if (data.status !== 'success') {
    await this.paymentModel.updateOne(
      { reference },
      { status: PaymentStatus.FAILED },
    );
    throw new BadRequestException('Payment verification failed');
  }

  await this.paymentModel.updateOne(
    {  reference },
    {
      status: PaymentStatus.SUCCESSFUL,
      paymentMethod: data.channel,
      currency: data.currency,
      paymentDetails: data.authorization,
      paymentDate: data.transaction_date,
    },
  );


  if (Array.isArray(data.metadata?.orderIds)) {
    await this.orderModel.updateMany(
      { _id: { $in: data.metadata.orderIds } },
      {
        $set: {
          status: OrderStatus.COMPLETED,
          isPaid: true,
          paymentMethod: data.channel || 'card',
          updatedAt: new Date(),
        },
      },
    );
  }

  return {
    msg: 'Payment verified successfully',
    data,
  }
}


    async handlePaystackWebhook(payload: any) {
    const { data, event } = payload;

    if (event === 'charge.success') {
    await this.paymentModel.updateOne(
      { reference: data.reference },
      {
        status: PaymentStatus.SUCCESSFUL,
        channel: data.channel,
        paymentDetails: data.authorization,
        paidAt: data.paidAt || data.transaction_date,
      },
    );

    // also mark the order as paid
   await this.orderModel.updateOne(
        { _id: data.metadata.orderId },
        {
            paymentStatus: 'PAID',
            isPaid: true,
            paidAt: data.transaction_date
        }
    )
  }
}

} 
