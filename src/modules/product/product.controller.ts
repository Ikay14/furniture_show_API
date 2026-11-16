import { Controller, Post, UseInterceptors, Req, Body, Patch, Get, Param, Query, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FilterListDto } from './DTO/product-query.dto';


@ApiTags('Products')
@Controller('product')
export class ProductController {
    constructor(private productService : ProductService){}

    @Get()
    @ApiOperation({ summary: 'Get all products with pagination and optional filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of products per page' })
    @ApiQuery({ name: 'name', required: false, type: String, example: 'Chair', description: 'Filter by product name' })
    @ApiQuery({ name: 'minPrice', required: false, type: Number, example: 50, description: 'Minimum price filter' })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number, example: 500, description: 'Maximum price filter' })
    @ApiQuery({ name: 'category', required: false, type: String, description: 'Category ID filter' })
    @ApiResponse({ status: 200, description: 'Products fetched successfully' })
    async getAllProducts(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query() filter: FilterListDto 
    ){
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.max(Number(limit), 1);

        return this.productService.getAllProducts(pageNum, limitNum, filter)
    }  

    @Get('category')
    @ApiOperation({ summary: 'Get all active product categories' })
    async getProductsByCategory() {
      return this.productService.getCategories()
    }

    @Get('category/:categoryId')
    @ApiOperation({ summary: 'Get products by category ID' })
    async getProductByCategory(
      @Param('categoryId') categoryId: string ,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,

    ) {
        return this.productService.getProductByCategory(categoryId, page, limit)
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