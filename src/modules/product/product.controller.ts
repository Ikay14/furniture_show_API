import { Controller, Post, UseInterceptors, Req, Body, Patch, Get, Param, Query, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('product')
export class ProductController {
    constructor(private productService : ProductService){}

    @Get()
    @ApiOperation({ summary: 'Get all products with pagination and optional filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of products per page' })
    @ApiQuery({ name: 'key', required: false, type: String, example: 'name', description: 'Field to filter by' })
    @ApiQuery({ name: 'value', required: false, type: String, example: 'Chair', description: 'Value to filter by' })
    @ApiResponse({ status: 200, description: 'Products fetched successfully' })
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
    @ApiOperation({ summary: 'Get a product by its ID' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product returned successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async getProductById(@Param('id')id: string){
        return this.productService.getAProduct(id)
    }
}