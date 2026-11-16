import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductDTO } from "src/modules/product/DTO/product.dto";
import { UpdateDTO } from "src/modules/product/DTO/updateProduct.dto";
import { Product } from "src/modules/product/model/product.model";
import { CloudinaryService } from "src/services/cloudinary.service";
import { Vendor } from "../model/vendor.model";
import { NotificationService } from "src/modules/notification/notification.service";
import Redis from "ioredis";
import { CACHE_TTL } from "src/config/db.config";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { DeleteProductDTO } from "src/modules/product/DTO/delete-product.dto";


@Injectable()
export class ProductManagementService {
    private readonly logger = new Logger(ProductManagementService.name);
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
        private notificationService: NotificationService,
        private cloudinaryService: CloudinaryService,
        @InjectRedis() private redisCache: Redis
    ) {}

    async createNewproduct(productDto: ProductDTO,images: Express.Multer.File[] ): Promise<{ msg: string; newProduct: Product }> {
        const { name, vendorId } = productDto

        if (!images || images.length === 0) throw new BadRequestException('Product image is required')

        const product = await this.productModel.findOne({ name })
        if (product) throw new BadRequestException('Product already exists')

        const imageUpload = await Promise.all(
            images.map(image => this.cloudinaryService.uploadFile(image, 'products', 'image'))
        );
        const newProduct = await new this.productModel({
            ...productDto,
            vendor: vendorId,
            images: imageUpload.map(imag => imag.secure_url)
        })

        await newProduct.save()

        const vendor = await this.vendorModel.findById(vendorId)
        if(!vendor) throw new NotFoundException('vendor not found')

        await this.notificationService.sendNewProductNotification({
            name: newProduct.name,
            email: vendor.email,
            vendorName: vendor.storeName
        })

        await this.invalidateVendorProductCache(vendorId);

        return {
            msg: 'Product created successfully',
            newProduct
            
        };
    } 


    async getAllVendorProducts(
        vendorId: string, page: number, limit: number ) {
        
        const cacheKey = `vendor-products:${vendorId}:${page}:${limit}` 
        const cachedvenProducts = await this.redisCache.get(cacheKey)
        if(cachedvenProducts) return JSON.parse(cachedvenProducts)

        const isVendor = await this.vendorModel.findById(vendorId)
        if(!isVendor) throw new UnauthorizedException('Unauthorized action, Not a Vendor ')
        this.logger.log(`Fetching products for vendorId: ${vendorId}, page: ${page}, limit: ${limit}`);

        const filter = { vendor: vendorId, isDeleted: false };
        const [products, total] = await Promise.all([
            this.productModel.find(filter)
                .populate('vendor', 'storeName email')
                .populate('category')
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.productModel.countDocuments(filter),
        ]);

        // if no products found, throw an error
        if (!products || products.length === 0) throw new BadRequestException('No products found for the given query');

        const responsePayload = {
            msg: 'Products fetched successfully', 
            pagination: {
                page,
                limit,
                total,
            },
            products
        };

        await this.redisCache.set(cacheKey, JSON.stringify(responsePayload), 'EX', CACHE_TTL)
        return responsePayload;
    }

    async getAProduct(productId: string):Promise<{msg: string, product: Product}>{
        const product = await this.productModel.findOne({ productId, isDeleted: false })
         .populate('category')
         .populate('vendor', 'storeName email')

        if(!product || product.inStock === 0) throw new NotFoundException('Product Found')

        return {
            msg: 'Product returned successfully',
            product
        }    
    }


async updateProduct(updateProductDto: UpdateDTO, images: Express.Multer.File[]){
    const { productId, vendorId } = updateProductDto

    const isVendor =  await this.vendorModel.findById(vendorId)
    if(!isVendor) throw new UnauthorizedException('Unauthorized action, Not a Vendor ')

    const imageUpload = images?.length
        ? await Promise.all(
            images.map(image => this.cloudinaryService.uploadFile(image, 'products', 'image'))
          )
        : [];
    const updatePayload: Record<string, any> = { ...updateProductDto };
    if (imageUpload.length > 0) {
        updatePayload.images = imageUpload.map(imag => imag.secure_url);
    }

    const product = await this.productModel.findOneAndUpdate(
        { productId, vendor: vendorId },
        { $set: updatePayload },
        { new: true, runValidators: true }
    )
    if(!product) throw new NotFoundException('Product Not Found')
        
    await this.notificationService.sendNewProductNotification({
            name: product.name,
            email: isVendor.email,
            vendorName: isVendor.storeName
        })    

    await this.invalidateVendorProductCache(vendorId);

    return {
        msg: 'product updated successfully',
        product
        
    }
}  

async deleteProduct(dto: DeleteProductDTO ): Promise<{ msg: string }> {

    const { productId, vendorId } = dto

    const isVendor = await this.vendorModel.findById(vendorId)
    if (!isVendor) throw new UnauthorizedException('Unauthorized action, Not a Vendor ')

    const deletedProduct = await this.productModel.findOneAndUpdate(
        { productId, vendor: vendorId },
        { $set: { isDeleted: true } },
        { new: true }
    )
    if (!deletedProduct) throw new NotFoundException('Product Not Found')

    await this.invalidateVendorProductCache(vendorId);

    return {
        msg: 'Product deleted successfully'
    }
}

private async invalidateVendorProductCache(vendorId: string): Promise<void> {
    const keys = await this.redisCache.keys(`vendor-products:${vendorId}:*`);
    if (keys.length > 0) {
        await this.redisCache.del(...keys);
    }
}

}