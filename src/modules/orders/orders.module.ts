import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './model/order.model';
import { Cart, CartSchema } from '../carts/model/carts.model';
import { ProductModule } from '../product/product.module';
import { User, UserSchema } from '../user/model/user.model';
import { CartsModule } from '../carts/carts.module';
import { PaymentService } from '../payment/payment.service';
import { Product, ProductSchema } from '../product/model/product.model';
import { Payment,PaymentSchema } from '../payment/model/payment.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    ProductModule,
    CartsModule
  ],  
  
  providers: [OrdersService,PaymentService],
  controllers: [OrdersController],
  exports: [OrdersService]
})
export class OrdersModule {}
