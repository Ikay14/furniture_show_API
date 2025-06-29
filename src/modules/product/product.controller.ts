import { Controller, Post, UseInterceptors, Req, Body } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDTO } from './DTO/product.dto'
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
    constructor(
        private productService: ProductService,
    ){}
    @Post('create-product')
    @UseInterceptors(FileInterceptor('file'))
    async createNewProduct(
        @Body() productDto: ProductDTO,
        @Req() req
    ) {
        const adminId = req.admin._id
        return this.productService.createNewproduct(productDto, adminId)
    }
}