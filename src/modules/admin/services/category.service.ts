import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "../model/category.model";
import { Admin } from "../model/admin.model";
import { CreateCategoryDTO } from "../DTO/create.category.DTO";
import { UpdateCategoryDTO } from "../DTO/update.category.dto";
import { CloudinaryService } from "src/services/cloudinary.service";
import { UploadApiResponse } from 'cloudinary';


@Injectable()
export class CategoryService {
    constructor(
        private cloudinaryService: CloudinaryService,
        @InjectModel(Category.name)
        private categoryModel: Model<Category>,
        @InjectModel(Admin.name)
        private adminModel: Model<Admin>
    ){}

     async createCategory(dto: CreateCategoryDTO, image: Express.Multer.File) {

    const { name, adminId } = dto

    const isCategoryExists = await this.categoryModel.findOne({ name })
    if (isCategoryExists) throw new BadRequestException(`Category with name ${name} already exists`)

    const isAdmin = await this.adminModel.findOne({ adminId })
    if (!isAdmin) throw new BadRequestException(`Admin with id ${adminId} not found`)

    const normalizedCategoryName = name.toLowerCase().trim()

    // Upload to Cloudinary
    const uploadResult: UploadApiResponse = await this.cloudinaryService.uploadFile(image, 'categories', 'image');

    if (!uploadResult || !uploadResult.secure_url) {
      throw new BadRequestException('Failed to upload image to Cloudinary');
    }

    // Save category with Cloudinary URL
    const newCategory = new this.categoryModel({
      name: normalizedCategoryName,
      description: dto.description,
      adminId: dto.adminId,
      imageUrl: uploadResult.secure_url, // cloudinary URL
    });
    
    await newCategory.save()

    return {
        msg: "new category created",
        newCategory
    }
  }
  

  async updateCategory(updateCategoryDTO: UpdateCategoryDTO, file?: Express.Multer.File): Promise<{ msg: string, category: Category }> {
      const { categoryId } = updateCategoryDTO

      const category = await this.categoryModel.findById(categoryId)
      if (!category) throw new BadRequestException(`Category with id ${categoryId} not found`)

      let imageUrl = category.imageUrl

      if (file) {
          const newUrl = await this.cloudinaryService.uploadFile(file, 'categories', 'image')

          if (imageUrl) {
              const publicId = await this.cloudinaryService.extractPublicId(imageUrl, 'categories')
              await this.cloudinaryService.deleteImage(publicId)
          }

          imageUrl = newUrl.secure_url
      }

      // Update category fields
      category.name = updateCategoryDTO.name ?? category.name
      category.description = updateCategoryDTO.description ?? category.description
      category.imageUrl = imageUrl

      await category.save()

      return { msg: "Category updated successfully", category }
  }

    async deleteCategory(_id: string): Promise<{ msg: string }> {
        const category = await this.categoryModel.findById(_id)

        if (!category) throw new BadRequestException(`Category with id ${_id} not found`)

        let imageUrl = category.imageUrl

        if (imageUrl) {
            const publicId = await this.cloudinaryService.extractPublicId(imageUrl, 'categories')
            await this.cloudinaryService.deleteImage(publicId)
        }

        category.isdeleted = true
        await category.save()

        return { msg: "Category deleted successfully" }
    }
}