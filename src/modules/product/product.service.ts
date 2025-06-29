import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './model/product.model';
import { ProductDTO } from './DTO/product.dto';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { request } from 'http';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        private cloudinaryService: CloudinaryService
    ) {}

    async createNewproduct(productDto: ProductDTO, adminId: { _id: string }): Promise<{ msg: string; newProduct: Product }> {
        const { name, description_of_product, price, stock, image, mainImage, dimensions,file } = productDto

        const product = await this.productModel.findOne({name})
        if (product) throw new BadRequestException('Product already exists')

        const folder = `products/${name}`;
        const imageUpload = await this.cloudinaryService.uploadFile(file, folder, 'image');
        const mainImageUpload = await this.cloudinaryService.uploadFile(file, folder, 'image')

        const newProduct = await new this.productModel({
            name,
            description_of_product,
            price,
            stock,
            image: imageUpload.secure_url,
            mainImage: mainImageUpload.public_id,
            dimensions,
            createdBy : adminId._id,
        })

        await newProduct.save();

        return {
            msg: 'Product created successfully',
            newProduct
            
        };
    }
}

