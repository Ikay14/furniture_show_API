import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.auth-controller';
import { AdminService } from './services/admin.auth-service';
import { Admin, AdminSchema } from './model/admin.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/model/order.model';
import { Product, ProductSchema } from '../product/model/product.model';
import { User, UserSchema } from '../user/model/user.model';
import { Category, CategorySchema } from './model/category.model'
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { CategoryService } from './services/category.service'
import { CategoryController } from './controllers/category.controller'
import { UserManagementController } from './controllers/user-management.controller';
import { UserManagementService } from './services/user.management.service';
import { GoogleStrategy } from 'src/stratgey/google.strategy';
import { MailService } from 'src/services/email.service';
import { VendorManagementCore } from './controllers/vendor.mgt';
import { VendorManagementService } from './services/vendor.mgt';
import { Vendor, VendorSchema } from '../vendor/model/vendor.model';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
  ],
  controllers: [AdminController, CategoryController, UserManagementController, VendorManagementCore],
  providers: [AdminService, JwtService, MailService, CategoryService, UserManagementService, CloudinaryService, GoogleStrategy, VendorManagementService],
})
export class AdminModule {}
