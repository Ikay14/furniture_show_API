import { Controller, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { CategoryService } from "../services/category.service";
import { CreateCategoryDTO } from "../DTO/create.category.DTO";
import { UpdateCategoryDTO } from "../DTO/update.category.dto";
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService){}

    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiBody({ type: CreateCategoryDTO })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    async createCategory(
        @Body() createCategoryDTO : CreateCategoryDTO
    ){
        return this.categoryService.createCategory(createCategoryDTO)
    }

    @Patch('update')
    @ApiOperation({ summary: 'Update an existing category' })
    @ApiBody({ type: UpdateCategoryDTO })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    async updateCategory(
        @Body() updateCategory: UpdateCategoryDTO
    ){
        return this.categoryService.updateCategory(updateCategory)
    } 

    @Delete(':id/delete')
    @ApiOperation({ summary: 'Delete a category by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Category ID' })
    @ApiResponse({ status: 200, description: 'Category deleted successfully' })
    async deleteCategory(
        @Param('id') id: string
    ){
        return this.categoryService.deleteCategory(id)
    }
}