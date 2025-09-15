import { Controller, UseInterceptors, Param, Query, Post, Patch, Body, Get, Delete, Req, UseGuards } from "@nestjs/common";
import { ProductManagementService } from "../services/product-management.service";
import { ProductDTO } from "src/modules/product/DTO/product.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductImageDto } from "src/modules/product/DTO/product.image.dto";
import { UpdateDTO } from "src/modules/product/DTO/updateProduct.dto";
import { JwtAuthGuard } from "src/guards/jwt.guard";
import { RolesGuard } from "src/modules/admin/guards/admin.auth-guard";
import { Roles } from "src/decorators/roles.decorator";
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/modules/decorators/roles.decorator'

@ApiTags('Vendor Product Management')
@Controller('vendor-product-mgt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('vendor')
export class ProductManagementController {
    constructor(
        private productService: ProductManagementService,
    ){}

    @Post('create-product')
    @ApiOperation({ summary: 'Create a new product' })
    @ApiBody({ type: ProductDTO })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @
    async createNewProduct(
        @Body() productDto: ProductDTO,
        @GetUser('vendorId') vendorId: string
    ) {
        return this.productService.createNewproduct(productDto, vendorId)
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
    @ApiResponse({ status: 200, description: 'Products fetched successfully' })
    async getAllProducts(
        @GetUser('vendorId') vendorId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ){
        const vendorId = req.vendor?._id;
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.max(Number(limit), 1);

        return this.productService.getAllVendorProducts(
            vendorId,
            { page: pageNum, limit: limitNum }
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
    async deleteProduct(
        @Param('id') id: string,
        @GetUser('vendorId') vendorId: string,){
        return this.productService.deleteProduct(id, adminId)
    }
}