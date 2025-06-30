import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from './model/product.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin,AdminSchema } from '../admin/model/admin.model';
import { CloudinaryService } from 'src/services/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Admin.name, schema: AdminSchema }
    ])
  ],
  controllers: [ProductController],
  providers: [ProductService, CloudinaryService]
})
export class ProductModule {}
