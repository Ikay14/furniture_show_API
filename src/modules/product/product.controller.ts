import { Controller, Post, UseInterceptors, Req, Body, Patch, Get, Param, Query, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDTO } from './DTO/product.dto'
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductImageDto } from './DTO/product.image.dto';
import { UpdateDTO } from './DTO/updateProduct.dto';

@Controller('product')
export class ProductController {
   
}