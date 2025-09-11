import { Module } from '@nestjs/common';
import { ProductManagementController } from './controllers/product-management.controller';
import { ProductManagementService } from './services/product-management.service';
import { OrderManagementController } from './controllers/order-management.controller';
import { OrderManagementService } from './services/order.management.service';
import { ApplyForVendorService } from './services/apply.vendor.service';
import { ApplyForVendorController } from './controllers/apply.vendor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vendor, VendorSchema } from './model/vendor.model';
import { Product, ProductSchema } from '../product/model/product.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { Order, OrderSchema } from '../orders/model/order.model';
import { User, UserSchema } from '../user/model/user.model';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ])
  ],
  controllers: [ProductManagementController, OrderManagementController, ApplyForVendorController],
  providers: [ProductManagementService, OrderManagementService, ApplyForVendorService, CloudinaryService, JwtService]
})
export class VendorModule {}
