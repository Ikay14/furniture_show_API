import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from './model/product.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin,AdminSchema } from '../admin/model/admin.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { Category, CategorySchema } from '../admin/model/category.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Category.name, schema: CategorySchema }
    ])
  ],
  controllers: [ProductController],
  providers: [ProductService, CloudinaryService],
  exports: [ ProductService ]
})
export class ProductModule {}
