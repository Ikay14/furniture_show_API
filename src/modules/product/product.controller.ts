import { Controller, Post, UseInterceptors, Req, Body, Patch, Get, Param, Query, Delete } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
    constructor(private productService : ProductService){}


@Get()
  async getAllProducts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('key') key: string = 'name', 
    @Query('value') value: string = '', 
  ){
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);

    return this.productService.getAllProducts(
      { page: pageNum, limit: limitNum },
      { key, value }
    )
  }  
        
   @Get(':id')
  async getProductById(@Param('id')id: string){
    return this.productService.getAProduct(id)
  }

}