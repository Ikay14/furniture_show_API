import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Payment,PaymentStatus } from './model/payment.model'
import { ClientSession, Connection, Model } from 'mongoose';
import { Order, OrderStatus } from '../orders/model/order.model';
import { PaymentDTO } from './DTO/payment.dto';
import { paystackConfig } from 'src/config/paystack.config';
import { generateTxRef } from 'src/utils/generate.txref';
import axios from 'axios';
import { Product } from '../product/model/product.model';


@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async initializePayment(paymentData: PaymentDTO) {
  const { orderIds, amount, email, customerId } = paymentData;

  // Generate transaction reference
  const txRef = generateTxRef() 

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


    async verifyPayment(reference: string):Promise<{ msg: string, data: any}> {
      const session = await this.connection.startSession();
      session.startTransaction();

    try { 

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

      await this.reduceStock(data.metadata?.orderIds, session)

      await this.paymentModel.updateOne(
        {  reference },
        {
          paymentMethod: data.channel,
          status: PaymentStatus.SUCCESSFUL,
          currency: data.currency,
          paymentDetails: data.authorization,
          paymentDate: data.transaction_date,
        },
    )


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
      })
    }
          await session.commitTransaction()
           session.endSession()
          return {
          msg: 'Payment verified successfully',
          data,
      }

  }   catch (err) {
      await session.abortTransaction()
      this.logger.log(err)
      throw err;
  }   finally {
      session.endSession()
     }
}
        async handleFailedPayment(reference: string) {
        const payment = await this.paymentModel.findOne({ reference })

        if (!payment) {
          this.logger.warn(`Payment with reference ${reference} not found.`)
          return
        }

        // If payment is already marked as failed or successful, skip
        if ([PaymentStatus.FAILED, PaymentStatus.SUCCESSFUL].includes(payment.status)) {
          this.logger.log(`Payment ${reference} already processed (${payment.status})`)
          return
        }

        // Update payment and related orders
        await this.paymentModel.updateOne(
          { reference },
          { $set: { status: PaymentStatus.FAILED, updatedAt: new Date() } } )

        await this.orderModel.updateMany(
          { _id: { $in: payment.orderId } },
          {
           $set: {
              status: OrderStatus.CANCELLED,
              updatedAt: new Date(),
            }, })

        this.logger.warn(`Payment ${reference} failed and orders cancelled.`);
}



// Helpers: ***********************************************************************
        private async reduceStock(items: any[], session: ClientSession) {
          const orders = items.map(item =>
            this.productModel.updateOne(
              { _id: item.product._id, inStock: { $gte: item.quantity } },
              { $inc: { inStock: -item.quantity } },
              { session }
            )
          )
          const results = await Promise.all(orders);

          if (results.some(res => res.modifiedCount === 0)) {
          throw new BadRequestException('One or more products are out of stock');
      }
  }
} 
