import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Logger } from '@nestjs/common';    
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './model/review.schema';
import { CreateReviewDto } from './dto/create.review.dto';
import { User } from '../user/model/user.model';
import { Product } from '../product/model/product.model';
import { Order, OrderStatus } from '../orders/model/order.model';
import { UpdateReviewDTO } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name)
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
            user: userId,
            'items.product': product._id,
            status: OrderStatus.COMPLETED,
        })    
        if (!isPurchased) throw new ForbiddenException('You can only review products you have purchased');

        // Check if already reviewed
        const existing = await this.reviewModel.findOne({ userId, productId })
        if (existing) throw new BadRequestException('You already reviewed this product')

        const newReview = await this.reviewModel.create({
            product: productId,
            user: userId,
            comment,
            rating,
            isVerifiedPurchase: true
        })

        // Update product rating summary
        await this.calcAverageRating(productId)

        return { msg: 'Review added successfully', newReview };
  }
 
    async getReviewsByProduct(productId: string, page: number, limit: number)
        :Promise<{ msg: string, reviews: Review[]}> {
      
        const reviews = await this.reviewModel
        .find({ product: productId })
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
        const { reviewId, productId, userId, comment, rating } = dto

        if(!productId) throw new BadRequestException('please provide productId')

        const getReview = await this.reviewModel.findOneAndUpdate( 
            { _id: reviewId, user: userId},
            { $set: { comment, rating } },
            { runValidators: true, new: true }
        )

        await this.calcAverageRating(productId)

        if (!getReview) throw new NotFoundException(`Review ${reviewId} not found or not owned by user`);

        return { msg: 'review updated', getReview }    
    }

    async deleteReview(reviewId: string){

        const getReview = await this.reviewModel.findByIdAndDelete(reviewId)

        if(!getReview) throw new NotFoundException(`${reviewId} not a found`)

        return { msg: 'review deleted'}    
    }

    // Helpers: ****************************************************** 
    private async calcAverageRating(productId: string){
        const stats = await this.reviewModel.aggregate([
            { $match: { productId: new Types.ObjectId(productId) } },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
        ])

        const { avgRating = 0, count = 0 } = stats[0] || {}

        await this.productModel.findByIdAndUpdate(productId, {
            $set: { averageRating: avgRating, reviewCount: count },
    });
        return { avgRating, count }
}

}
