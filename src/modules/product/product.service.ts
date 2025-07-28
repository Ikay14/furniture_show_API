import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './model/product.model';
import { Model } from 'mongoose';
import { Category } from '../admin/model/category.model';



export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Category.name) private categoryModel: Model<Category>
    ) {}

    async getAllProducts(param: { page: number; limit: number }, query: { key: string; value: string }): Promise<{ products: Product[]; pagination: { page: number; limit: number; total: number }; msg: string }> {
            // accept pagination and query parameters
            const { page, limit } = param;
    
            // destructure the query parameters
            const { key, value } = query;
            
            const products = await this.productModel.find({ [key]: value })
                .skip((page - 1) * limit)
                .limit(limit);
    
            // if no products found, throw an error
                if( query && !products.length) throw new BadRequestException('No products found for the given query');
    
                if (!products.length && products.length === 0) throw new BadRequestException('No products found');
    
            // return the products
            return {
                msg: 'Products fetched successfully',
                pagination: {
                    page,
                    limit,
                    total: await this.productModel.countDocuments({ [key]: value }),
                },
                products
            }
        }
    
        async getAProduct(productId: string):Promise<{msg: string, product: Product}>{
            const product = await this.productModel.findOne({ productId })
    
            if(!product || product.inStock === 0) throw new NotFoundException('Product Found')
    
            return {
                msg: 'Product returned successfully',
                product
            }    
        }

    async getProductByCategory(categoryId: string, page: number, limit: number): Promise<{ msg: string; products: Product[], total: number; limit: number; page: number }> {

        const products = await this.productModel.find({ category: categoryId })
        .populate('category')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })

        const total = await this.productModel.countDocuments({ category: categoryId })
        
        if(!products || products.length === 0) throw new NotFoundException('No products found for this category')

        return {
            msg: 'Products found successfully',
            products,
            total,
            limit,
            page
        }
    }

    async getCategories(): Promise<{ msg: string; categories: Category[] }> {

    // Fetch distinct category IDs from products
    const categoryIds = await this.productModel.find().distinct('category');

    if (!categoryIds.length) throw new NotFoundException('No categories found');

    // Fetch categories based on the distinct IDs
    const categories = await this.categoryModel.find({ _id: { $in: categoryIds } });

    return {
        msg: 'Categories fetched successfully',
        categories,
  };
}

}