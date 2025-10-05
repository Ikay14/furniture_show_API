import { Module } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartsController } from './carts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/model/user.model';
import { Cart, CartSchema } from './model/carts.model';
import { Product, ProductSchema } from '../product/model/product.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthModule
  ],
  providers: [CartService],
  controllers: [CartsController],
  exports: [CartService]
})
export class CartsModule {}
