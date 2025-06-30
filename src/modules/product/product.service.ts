import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './model/product.model';
import { Admin } from '../admin/model/admin.model';
import { ProductDTO } from './DTO/product.dto';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { UpdateDTO } from './DTO/updateProduct.dto';
import { ProductImageDto } from './DTO/product.image.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Admin.name) private adminModel: Model<Admin>,
        private cloudinaryService: CloudinaryService
    ) {}

    async createNewproduct(productDto: ProductDTO, adminId: { _id: string }): Promise<{ msg: string; newProduct: Product }> {
        const { name, description_of_product, price, stock, dimensions } = productDto

        const isAdminId =  await this.adminModel.findOne({ adminId })
        if(!isAdminId) throw new UnauthorizedException('Unauthorized action, Not an Admin ')

        const product = await this.productModel.findOne({name})
        if (product) throw new BadRequestException('Product already exists')

        const newProduct = await new this.productModel({
            name,
            description_of_product,
            price,
            stock,
            dimensions,
            createdBy : adminId._id,
        })

        await newProduct.save();

        return {
            msg: 'Product created successfully',
            newProduct
            
        };
    } 


 async uploadProductImage(productImage: ProductImageDto) {
    const { adminId, productId, file } = productImage;
    if (!adminId || !productId || !file) throw new BadRequestException('Missing required fields: adminId, productId, or file')
    
    const isAdmin = await this.adminModel.findOne({ adminId });
    if (!isAdmin) throw new UnauthorizedException('Unauthorized action. Admin access required.')
    

    const folder = `products/${productId}`

    let imageUpload;
    try {
        imageUpload = await this.cloudinaryService.uploadFile(file, folder, 'image');
    } catch (err) {
        throw new InternalServerErrorException('Image upload failed. Please try again later.');
    }


    const product = await this.productModel.findOneAndUpdate(
        { productId },
        { $set: { imageUrl: imageUpload?.secure_url } },
        { new: true, runValidators: true }
    )

    if (!product) throw new NotFoundException('Product not found')

    return {
        msg: 'Product image uploaded successfully',
        productId: product._id,
        imageUrl: product.images
    };
}


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


async updateProduct(updateProductDto: UpdateDTO){
    const { adminId, productId } = updateProductDto

    const isAdminId =  await this.adminModel.findOne({ adminId })
    if(!isAdminId) throw new UnauthorizedException('Unauthorized action, Not an Admin ')

    const product = await this.productModel.findOneAndUpdate(
        { productId },
        { $set: updateProductDto },
        { new: true, runValidators: true }
    )
    if(!product) throw new NotFoundException('Product Not Found')

    const newProduct = product    

    return {
        msg: 'product updated successfully',
        newProduct
        
    }
}  

async deleteProduct(productId: string, adminId: { _id: string }): Promise<{ msg: string; deletedProduct: Product }> {
    const isAdminId = await this.adminModel.findOne({ adminId })
    if (!isAdminId) throw new UnauthorizedException('Unauthorized action, Not an Admin ')

    const deletedProduct = await this.productModel.findOneAndUpdate(
        { productId },
        { $set: { isDeleted: true } },
        { new: true }
    )
    if (!deletedProduct) throw new NotFoundException('Product Not Found')

    return {
        msg: 'Product deleted successfully',
        deletedProduct
    }
}

}