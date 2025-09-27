import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductDTO } from "src/modules/product/DTO/product.dto";
import { ProductImageDto } from "src/modules/product/DTO/product.image.dto";
import { UpdateDTO } from "src/modules/product/DTO/updateProduct.dto";
import { Product } from "src/modules/product/model/product.model";
import { CloudinaryService } from "src/services/cloudinary.service";
import { Vendor } from "../model/vendor.model";
import { NotificationService } from "src/modules/notification/notifcation.service";
import Redis from "ioredis";
import { CACHE_TTL } from "src/config/db.config";


@Injectable()
export class ProductManagementService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
        private notificationService: NotificationService,
        private cloudinaryService: CloudinaryService,
        private redisCache: Redis
    ) {}

    async createNewproduct(productDto: ProductDTO, vendorId: string ): Promise<{ msg: string; newProduct: Product }> {
        const { name, description_of_product, price, stock, dimensions } = productDto

        const product = await this.productModel.findOne({ name })
        if (product) throw new BadRequestException('Product already exists')

        const newProduct = await new this.productModel({
            name,
            description_of_product,
            price,
            stock,
            dimensions,
            createdBy : vendorId,
        })

        await newProduct.save()

        const vendor = await this.vendorModel.findById(vendorId)
        if(!vendor) throw new NotFoundException('vendor not found')

        await this.notificationService.sendNewProductNotification({
            name: newProduct.name,
            email: vendor.email,
            vendorName: vendor.storeName
        })

        return {
            msg: 'Product created successfully',
            newProduct
            
        };
    } 


 async uploadProductImage(productImage: ProductImageDto) {
    const { productId, file } = productImage;

    if (!productId || !file) throw new BadRequestException('Missing required fields: vendorId, productId, or file')

    // const isVendor = await this.vendorModel.findOne({ vendorId });
    // if (!isVendor) throw new UnauthorizedException('Unauthorized action. Vendor access required.')

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


    async getAllVendorProducts(
        vendorId: string,
        param: { page: number; limit: number }) {

        const { page, limit } = param

        const cacheKey = `vendor-products:${page}:${limit}` 

        const cachedvenProducts = await this.redisCache.get(cacheKey)
        if(cachedvenProducts) return JSON.parse(cachedvenProducts)


        const [products, total] = await Promise.all([
            this.productModel.find({ vendor: vendorId })
                .populate('vendor', 'storeName email')
                .skip((param.page - 1) * param.limit)
                .limit(param.limit)
                .lean(),
            this.productModel.countDocuments({ vendor: vendorId })
        ])

        // if no products found, throw an error
        if (!products) throw new BadRequestException('No products found for the given query');

        await this.redisCache.hset(cacheKey, JSON.stringify(products), 'EX', CACHE_TTL)
        // return the products
        return {
            msg: 'Products fetched successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
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
    const { productId } = updateProductDto

    // const isVendorId =  await this.vendorModel.findOne({ vendorId })
    // if(!isVendorId) throw new UnauthorizedException('Unauthorized action, Not a Vendor ')

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

async deleteProduct(productId: string, vendorId: string ): Promise<{ msg: string; deletedProduct: Product }> {
    const isVendorId = await this.vendorModel.findOne({ vendorId })
    if (!isVendorId) throw new UnauthorizedException('Unauthorized action, Not a Vendor ')

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