import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Server } from 'http';
import { Mongoose } from 'mongoose';
import serverConfig from './config/server.config';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentModule } from './modules/payment/payment.module';
import { VendorModule } from './modules/vendor/vendor.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load : [serverConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService : ConfigService) =>({
        uri: configService.get<string>('MONGO_URI')
      }), 
      inject: [ConfigService],
    }),
    AdminModule,
    ProductModule,
    UserModule,
    AuthModule,
    ReviewsModule,
    CartsModule,
    OrdersModule,
    PaymentModule,
    VendorModule,
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
