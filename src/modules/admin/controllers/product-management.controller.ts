import { Controller, UseInterceptors, Param, Query, Post, Patch, Body, Get, Delete, Req } from "@nestjs/common";
import { ProductManagementService } from "../services/product-management.service";
import { ProductDTO } from "src/modules/product/DTO/product.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductImageDto } from "src/modules/product/DTO/product.image.dto";
import { UpdateDTO } from "src/modules/product/DTO/updateProduct.dto";

@Controller('admin/product-management')
export class ProductManagementController {
     constructor(
        private productService: ProductManagementService,
    ){}


    @Post('creatze-product')
    async createNewProduct(
        @Body() productDto: ProductDTO,
        @Req() req
    ) {
        const adminId = req.admin._id
        return this.productService.createNewproduct(productDto, adminId)
    }

    @Patch('/:id/images')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@Req() req, @Body() file: ProductImageDto) {
        return this.productService.uploadProductImage(file)
    }

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
    );
  }

  @Get(':id')
  async getProductById(@Param('id')id: string){
    return this.productService.getAProduct(id)
  }

  @Patch(':id/update-product')
  async updateProduct(@Body()update: UpdateDTO){
    return this.productService.updateProduct(update)
  }

  @Delete(':id/delete-product')
  async deleteProduct(@Param('id') id: string, @Req() req: any,){
    const adminId = req.admin._id
    return this.productService.deleteProduct(id, adminId)
  }
}