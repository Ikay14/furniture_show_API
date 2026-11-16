import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CartService } from './carts.service';
import { Cart } from './model/carts.model';

describe('CartService - SKU Variants', () => {
  let service: CartService;
  let productModel: any;
  let cartModel: any;

  beforeEach(async () => {
    const mockCart = {
      items: [] as any[],
      totalPrice: 0,
      populate: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(true),
    };

    cartModel = {
      findOne: jest.fn().mockResolvedValue(mockCart),
    };

    productModel = {
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          name: 'Velvet Sofa',
          price: 1000,
          vendor: { _id: new Types.ObjectId() },
          variants: [
            { sku: 'SOFA-EMERALD', colorName: 'Emerald', priceDelta: 150, inStock: 3 },
            { sku: 'SOFA-CREAM', colorName: 'Cream', priceDelta: 0, inStock: 0 },
          ],
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: cartModel },
        { provide: getModelToken('Product'), useValue: productModel },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('resolves variant unitPrice using price + priceDelta', async () => {
    const cart = await service.addToCart('user-1', {
      items: [{ productId: 'prod-1', quantity: 2, variantSku: 'SOFA-EMERALD' }],
    });

    expect(cart.items[0].variantSku).toBe('SOFA-EMERALD');
    expect(cart.items[0].unitPrice).toBe(1150);
    expect(cart.totalPrice).toBe(2300);
  });

  it('rejects missing variant SKU and out-of-stock variant', async () => {
    await expect(
      service.addToCart('user-1', {
        items: [{ productId: 'prod-1', quantity: 1, variantSku: 'INVALID-SKU' }],
      }),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.addToCart('user-1', {
        items: [{ productId: 'prod-1', quantity: 1, variantSku: 'SOFA-CREAM' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
