import { Controller, Post, Get, Body, Req, Param, Query, UseGuards, Patch, Delete, Logger } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create.review.dto';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { GetUser } from 'src/decorators/user.decorator';
import { UpdateReviewDTO } from './dto/update-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
    
    constructor(private reviewService: ReviewsService) {}

    @Post('add-review')
    @ApiOperation({ summary: 'Add a review for a product' })
    @ApiBody({ type: CreateReviewDto, description: 'Review data' })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    async createReview(
        @Body() createReview: CreateReviewDto,
        @GetUser('id') userId: string
    ) {
        return this.reviewService.createReview(createReview, userId);
    }

    @Get(':id/get-reviews')
    @ApiOperation({ summary: 'Get reviews for a product by product ID' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of reviews per page' })
    @ApiResponse({ status: 200, description: 'Reviews fetched successfully' })
    async getProductReviews(
        @Param('id') id: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.reviewService.getReviewsByProduct(id, page, limit);
    }

    @Patch('update-review')
    @ApiOperation({ summary: 'Update review for a product' })
    @ApiBody({ type: UpdateReviewDTO, description: 'update Review data' })
    @ApiResponse({ status: 201, description: 'Review update created successfully' })
    async updateReview(dto: UpdateReviewDTO){
        return this.reviewService.updateReview(dto)
    }

    @Delete(':reviewId/del-review')
    @ApiOperation({ summary: 'Delete review for a product' })
    @ApiParam({ name: 'reviewId', type: String, description: 'reviewId' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    async deleteReview(@Param('reviewId') reviewId: string
    ){
        return this.reviewService.deleteReview(reviewId)
    }
}
