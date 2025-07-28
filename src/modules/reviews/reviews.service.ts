import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';    
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from './model/review.schema';
import { CreateReviewDto } from './dto/create.review.dto';
import { User } from '../user/model/user.model';
import { Product } from '../product/model/product.model';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<Review>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Product.name) private productModel: Model<Product>
    ) {}

    async createReview(createReviewDto: CreateReviewDto, userId: string): 
        Promise<{ msg: string, review: Review }> {

        const { productId, comment, rating } = createReviewDto

        const product = await this.productModel.findOne({ productId })
        if(!product) throw new NotFoundException(`No product found with id ${productId}`)

        const newReview = await this.reviewModel.create({
            product: productId,
            user: userId,
            comment,
            rating
        })

        return { 
            msg: 'Review created successfully', 
            review: newReview }
    }
 
    async getReviewsByProduct(productId: string, page: number, limit: number)
        :Promise<{ msg: string, reviews: Review[]}> {
      
        const reviews = await this.reviewModel.find({ product: productId })
        .populate('user')
        .sort({ createdAt: -1 })
        .skip((  page - 1) * limit)
        .limit(limit)

        if (!reviews || reviews.length === 0) throw new BadRequestException('No reviews found for this product');
        
        return {
            msg: 'reviews returned successfully',
            reviews
        }
    }

}
