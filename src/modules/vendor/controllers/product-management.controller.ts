import { Controller, UseInterceptors, Param, Query, Post, Patch, Body, Get, Delete, Req, UseGuards, UploadedFiles } from "@nestjs/common";
import { ProductManagementService } from "../services/product-management.service";
import { ProductDTO } from "src/modules/product/DTO/product.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { UpdateDTO } from "src/modules/product/DTO/updateProduct.dto";
import { JwtAuthGuard } from "src/guards/jwt.guard";
import { Roles } from "src/decorators/roles.decorator";
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetUser } from "src/decorators/user.decorator";
import { DeleteProductDTO } from "src/modules/product/DTO/delete-product.dto";

@ApiTags('Vendor Product Management')
@Controller('vendor-product-mgt')
@UseGuards(JwtAuthGuard)
@Roles('vendor')
export class ProductManagementController {
    constructor(
        private productService: ProductManagementService,
    ){}

    @Post('create-product')
    @UseInterceptors(FilesInterceptor('images', 4))
    @ApiOperation({ summary: 'Create a new product' })
    @ApiBody({ type: ProductDTO })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async createNewProduct(
        @Body() productDto: ProductDTO,
        @UploadedFiles() images: Express.Multer.File[],
    ) {

        return this.productService.createNewproduct( productDto,
        images
         )
    }


    @Get()
    @ApiOperation({ summary: 'Get all products with pagination and optional filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of products per page' })
    @ApiResponse({ status: 200, description: 'Products fetched successfully' })
    async getAllProducts(
        @Query('vendorId') vendorId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ){
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.max(Number(limit), 1);

        return this.productService.getAllVendorProducts(
            vendorId, pageNum, limitNum 
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

    @Patch('update-product')
    @ApiOperation({ summary: 'Update a product by its ID' })
    @UseInterceptors(FilesInterceptor('images', 4))
    @ApiBody({ type: UpdateDTO })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    async updateProduct(
        @Body()update: UpdateDTO,
        @UploadedFiles() images: Express.Multer.File[],
    ){
        return this.productService.updateProduct(update, images)
    }

    @Patch('delete-product')
    @ApiOperation({ summary: 'Delete a product by its ID' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    async deleteProduct(
        @Body() dto: DeleteProductDTO){
        return this.productService.deleteProduct(dto)
    }
} 