import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product } from './model/product.model';
import { Category } from '../admin/model/category.model';

describe('ProductService', () => {
  let service: ProductService;
  let productModel: any;

  beforeEach(async () => {
    const chain = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };

    productModel = {
      find: jest.fn().mockReturnValue(chain),
      countDocuments: jest.fn().mockResolvedValue(0),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(Category.name), useValue: {} },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('returns empty list without throwing when no products match filter', async () => {
    const result = await service.getAllProducts(1, 10, {});
    expect(result).toEqual({
      products: [],
      pagination: { page: 1, limit: 10, total: 0 },
    });
    expect(productModel.find).toHaveBeenCalledWith({
      isDeleted: { $ne: true },
      status: 'active',
    });
  });

  it('throws NotFoundException with accurate message when product is missing', async () => {
    productModel.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(service.getAProduct('missing-id')).rejects.toThrow(
      new NotFoundException('Product not found'),
    );
  });
});
