import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReviewsService } from './reviews.service';
import { Review } from './model/review.schema';
import { User } from '../user/model/user.model';
import { Order } from '../orders/model/order.model';
import { Product } from '../product/model/product.model';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewModel: any;
  let productModel: any;
  let orderModel: any;

  beforeEach(async () => {
    reviewModel = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ _id: 'rev-1' }),
      aggregate: jest.fn().mockResolvedValue([{ avgRating: 4.5, count: 2 }]),
    };

    productModel = {
      findById: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    };

    orderModel = {
      findOne: jest.fn().mockResolvedValue({ _id: 'order-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getModelToken(Review.name), useValue: reviewModel },
        { provide: getModelToken(User.name), useValue: {} },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('checks duplicate review using user/product fields and updates numReviews', async () => {
    const productId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();

    await service.createReview(
      { productId, rating: 5, comment: 'Solid oak' },
      userId,
    );

    expect(reviewModel.findOne).toHaveBeenCalledWith({
      user: userId,
      product: productId,
    });
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(productId, {
      $set: { averageRating: 4.5, numReviews: 2 },
    });
  });
});
