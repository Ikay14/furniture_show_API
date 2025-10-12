import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';    
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './model/review.schema';
import { CreateReviewDto } from './dto/create.review.dto';
import { User } from '../user/model/user.model';
import { Product } from '../product/model/product.model';
import { Order } from '../orders/model/order.model';
import { UpdateReviewDTO } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<Review>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Product.name) private productModel: Model<Product>
    ) {}

    async createReview(createReviewDto: CreateReviewDto, userId: string) {

        const { productId, comment, rating } = createReviewDto

        const product = await this.productModel.findById(productId)
        if(!product) throw new NotFoundException(`No product found with id ${productId}`)

        const isPurchased = await this.orderModel.findOne({ 
            userId,
            'item.product': product._id,
            status: 'DELIVERED',
        })    

        if (!isPurchased) throw new ForbiddenException('You can only review products you have purchased');

        // Check if already reviewed
        const existing = await this.reviewModel.findOne({ userId, productId });
        if (existing) throw new BadRequestException('You already reviewed this product');

        const newReview = await this.reviewModel.create({
            product: productId,
            user: userId,
            comment,
            rating,
            isVerifiedPurchase: true
        })

        // Update product rating summary
        const stats = await this.reviewModel.aggregate([
            { $match: { productId: new Types.ObjectId(productId) } },
            {
                $group: {
                    _id: '$productId',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
        ])

        const { avgRating = 0, count = 0 } = stats[0] || {}

        await this.productModel.findByIdAndUpdate(productId, {
            $set: { averageRating: avgRating, reviewCount: count },
    });

        return { msg: 'Review added successfully', newReview };
  }
 
    async getReviewsByProduct(productId: string, page: number, limit: number)
        :Promise<{ msg: string, reviews: Review[]}> {
      
        const reviews = await this.reviewModel.find({ product: productId })
        .find({ productId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((  page - 1) * limit)
        .limit(limit)

        if (!reviews || reviews.length === 0) throw new BadRequestException('No reviews found for this product');
        
        return {
            msg: 'reviews returned successfully',
            reviews
        }
    }

    async updateReview(dto: UpdateReviewDTO){
        const { reviewId } = dto

        const getReview = await this.reviewModel.findByIdAndUpdate(
                reviewId,
            { $set: dto },
            { runValidators: true, new: true }
        )

        if(!getReview) throw new NotFoundException(`${reviewId} not a found`)

        return { msg: 'review updated', getReview }    
    }

    async deleteReview(reviewId: string){

        const getReview = await this.reviewModel.findByIdAndDelete(reviewId)

        if(!getReview) throw new NotFoundException(`${reviewId} not a found`)

        return { msg: 'review deleted'}    
    }

}
