import { Controller, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { CategoryService } from "../services/category.service";
import { CreateCategoryDTO } from "../DTO/create.category.DTO";
import { UpdateCategoryDTO } from "../DTO/update.category.dto";

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService){}
    @Post()
    async createCategory(
        @Body() createCategoryDTO : CreateCategoryDTO
    ){
        return this.categoryService.createCategory(createCategoryDTO)
    }

    @Patch('update')
    async updateCategory(
        @Body() updateCategory: UpdateCategoryDTO){
            return this.categoryService.updateCategory(updateCategory)
    } 

    @Delete(':id/delete')
    async deleteCategory(
        @Param('id') id: string
    ){
        return this.categoryService.deleteCategory(id)
    }
}