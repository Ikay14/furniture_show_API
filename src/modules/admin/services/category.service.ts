import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "../model/category.model";
import { CreateCategoryDTO } from "../DTO/create.category.DTO";
import { UpdateCategoryDTO } from "../DTO/update.category.dto";


@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name)
        private categoryModel: Model<Category>
    ){}

    async createCategory(createCategoryDTO: CreateCategoryDTO):Promise<{ msg: string, category : Category}>{
        const { name, description } = createCategoryDTO

        const isCategoryExists = await this.categoryModel.findOne({ name })

        if(isCategoryExists) throw new BadRequestException(`Category with name ${name} already exists`)

        const normalizedCategoryName = name.toLowerCase().trim()

        const category = await this.categoryModel.create({
            name: normalizedCategoryName,
            description
        })

        return { msg: "Category created successfully", category }
    }

    async updateCategory(updateCategoryDTO: UpdateCategoryDTO): Promise<{ msg: string, category: Category }> {
        const { _id } = updateCategoryDTO

        const category = await this.categoryModel.findByIdAndUpdate(_id, {
            ...updateCategoryDTO
        }, { runValidators: true, new: true })

        if (!category) throw new BadRequestException(`Category with id ${_id} not found`)

        return { msg: "Category updated successfully", category }
    }

    async deleteCategory(_id: string): Promise<{ msg: string }> {
        const category = await this.categoryModel.findByIdAndUpdate(_id, { isdeleted: true }, { new: true })

        if (!category) throw new BadRequestException(`Category with id ${_id} not found`)

        return { msg: "Category deleted successfully" }
    }
}