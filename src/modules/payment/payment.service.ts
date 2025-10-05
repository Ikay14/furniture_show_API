import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment,PaymentStatus } from './model/payment.model'
import { Model, Types } from 'mongoose';
import { Order } from '../orders/model/order.model';
import { PaymentDTO } from './DTO/payment.dto';
import { paystackConfig } from 'src/config/paystack.config';
import { generateTxRef } from 'src/utils/generate.txref';
import axios from 'axios';


@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async initializePayment(paymentData: PaymentDTO) {
  const { orderId, amount, email, customerId } = paymentData;

  // Fetch all orders
  const orders = await this.orderModel.find({
    _id: { $in: orderId },
    user: customerId,
    status: 'PENDING_PAYMENT',
  });

  if (!orders || orders.length === 0) {
    throw new NotFoundException('No pending orders found for payment');
  }

  // Generate transaction reference
  const txRef = generateTxRef();

  // Create payment record
  const payment = await this.paymentModel.create({
    txRef,
    email,
    amount,
    orderId, // now an array
    paymentDate: new Date(),
    customerId,
    status: PaymentStatus.INITIATED,
  });

  try {
    // Call Paystack initialize
    const response = await axios.post(
      `${paystackConfig.baseUrl}/transaction/initialize`,
      {
        reference: txRef,
        amount: amount * 100, // Paystack expects kobo
        email,
        metadata: {
          orderId,
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


    async verifyPayment(ref: string){
        const response = await axios.get(
            `${paystackConfig.baseUrl}/transaction/verify/${ref}`,
            {
                headers: {
                    Authorization: `Bearer ${paystackConfig.secretKey}`,
                },
            }
        )

        const data = response.data.data
        if (data.status === 'success'){
            await this.paymentModel.updateOne(
                { ref },
                {
                    status: PaymentStatus.SUCCESSFUL,
                    paymentMethod: data.channel,
                    paymentDetails: data.authorization,
                    paymentDate: data.transaction_date
                }
            )

            await this.orderModel.updateOne(
                { _id: data.metadata.orderId },
                {
                    paymentStatus: 'PAID',
                    isPaid: true,
                    paidAt: data.transaction_date
                }
            )
        }

  
        return {
            msg: 'Payment verified successfully',
            data
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
