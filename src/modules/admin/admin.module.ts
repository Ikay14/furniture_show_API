import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.auth-controller';
import { AdminService } from './services/admin.auth-service';
import { Admin, AdminSchema } from './model/admin.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/model/order.model';
import { Product, ProductSchema } from '../product/model/product.model';
import { User, UserSchema } from '../user/model/user.model';
import { JwtService } from '@nestjs/jwt';
import { ProductManagementService } from './services/product-management.service';
import { ProductManagementController } from './controllers/product-management.controller';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { OrderManagementController } from './controllers/order-management.controller';
import { UserManagementController } from './controllers/user-management.controller';
import { OrderManagementService } from './services/order.management.service';
import { UserManagementService } from './services/user.management.service';
import { GoogleStrategy } from 'src/stratgey/google.strategy';
import { MailService } from 'src/services/email.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [AdminController, ProductManagementController, OrderManagementController, UserManagementController],
  providers: [AdminService, JwtService, MailService, ProductManagementService, OrderManagementService, UserManagementService, CloudinaryService, GoogleStrategy],
})
export class AdminModule {}
