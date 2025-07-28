import { Controller, Post, Get, Body, Req, Param,Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create.review.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(private reviewService: ReviewsService){}

    @Post('add-review')
    async createReview(
        @Body() createReview: CreateReviewDto,
        @Req() req
    ){
        const userId = req.user.id
        return this.reviewService.createReview(createReview, userId)
    }

    @Get(':id/get-reviews')
    async getProductReviews(
        @Param('id') id: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10

    ){
        return this.reviewService.getReviewsByProduct(id, page, limit)
    }
}
