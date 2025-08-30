import { Controller, UseInterceptors, Param, Query, Post, Patch, Body, Get, Delete, Req, UseGuards } from "@nestjs/common";
import { ProductManagementService } from "../services/product-management.service";
import { ProductDTO } from "src/modules/product/DTO/product.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductImageDto } from "src/modules/product/DTO/product.image.dto";
import { UpdateDTO } from "src/modules/product/DTO/updateProduct.dto";
import { JwtAuthGuard } from "src/guards/jwt.guard";
import { RolesGuard } from "../guards/admin.auth-guard";
import { Roles } from "../guards/roles.guard";
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admin Product Management')
@Controller('admin-product-mgt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class ProductManagementController {
    constructor(
        private productService: ProductManagementService,
    ){}

    @Post('create-product')
    @ApiOperation({ summary: 'Create a new product' })
    @ApiBody({ type: ProductDTO })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async createNewProduct(
        @Body() productDto: ProductDTO,
        @Req() req
    ) {
        const adminId = req.admin._id
        return this.productService.createNewproduct(productDto, adminId)
    }

    @Patch('/:id/images')
    @ApiOperation({ summary: 'Upload images for a product' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID' })
    @ApiBody({ type: ProductImageDto })
    @ApiResponse({ status: 200, description: 'Product images uploaded successfully' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@Req() req, @Body() file: ProductImageDto) {
        return this.productService.uploadProductImage(file)
    }

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
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by its ID' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product returned successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async getProductById(@Param('id')id: string){
        return this.productService.getAProduct(id)
    }

    @Patch(':id/update-product')
    @ApiOperation({ summary: 'Update a product by its ID' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID' })
    @ApiBody({ type: UpdateDTO })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    async updateProduct(@Body()update: UpdateDTO){
        return this.productService.updateProduct(update)
    }

    @Delete(':id/delete-product')
    @ApiOperation({ summary: 'Delete a product by its ID' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    async deleteProduct(@Param('id') id: string, @Req() req: any,){
        const adminId = req.admin._id
        return this.productService.deleteProduct(id, adminId)
    }
}