import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment, PaymentSchema } from './model/payment.model';
import { Order,OrderSchema } from '../orders/model/order.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Order.name, schema: OrderSchema },
        { name: Payment.name, schema: PaymentSchema },
      ]),
    ],
  providers: [PaymentService],
  controllers: [PaymentController]
}) 
export class PaymentModule {}  
