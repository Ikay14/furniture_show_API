import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './model/product.model';
import { Admin } from '../admin/model/admin.model';
import { ProductDTO } from './DTO/product.dto';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { UpdateDTO } from './DTO/updateProduct.dto';
import { ProductImageDto } from './DTO/product.image.dto';

export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>
    ) {}
}