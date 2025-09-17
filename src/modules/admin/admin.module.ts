import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.auth-controller';
import { AdminService } from './services/admin.auth-service';
import { Admin, AdminSchema } from './model/admin.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/model/order.model';
import { Product, ProductSchema } from '../product/model/product.model';
import { User, UserSchema } from '../user/model/user.model';
import { Category, CategorySchema } from './model/category.model'
import { JwtStrategy } from 'src/stratgey/jwt.strategy';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { CategoryService } from './services/category.service'
import { CategoryController } from './controllers/category.controller'
import { UserManagementController } from './controllers/user-management.controller';
import { UserManagementService } from './services/user.management.service';
import { GoogleStrategy } from 'src/stratgey/google.strategy';
import { MailService } from 'src/services/email.service';
import { VendorManagementController } from './controllers/vendor.mgt.controller';
import { VendorManagementService } from './services/vendor.mgt.service';
import { Vendor, VendorSchema } from '../vendor/model/vendor.model';
import { RedisModule } from '@nestjs-modules/ioredis';
import { JwtModule } from '@nestjs/jwt';

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
   RedisModule.forRoot({
      type: 'single',
      options: {
        host: process.env.REDIS_HOST,     
        port: parseInt(process.env.REDIS_PORT || '10364'), 
        password: process.env.REDIS_PASSWORD,       
      },
    }),
    JwtModule.register({
          secret: process.env.JWT_SECRET, 
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
  ],
  controllers: [AdminController, CategoryController, UserManagementController, VendorManagementController],
  providers: [AdminService, JwtStrategy, MailService, CategoryService, UserManagementService, CloudinaryService, GoogleStrategy, VendorManagementService],
})
export class AdminModule {}
