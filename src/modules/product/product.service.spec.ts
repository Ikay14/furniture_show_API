import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product } from './model/product.model';
import { Category } from '../admin/model/category.model';
import { RoomType } from './DTO/room-bundle.dto';

describe('ProductService - Fit My Space & Room Bundler', () => {
  let service: ProductService;
  let productModel: any;

  const sampleProducts = [
    {
      _id: 'p1',
      name: 'Compact Oak Sofa',
      category: { _id: 'cat-sofa', name: 'Sofas' },
      price: 900,
      inStock: 4,
      material: 'Oak',
      colorOptions: ['beige', 'walnut'],
      tags: ['living room', 'modern'],
      averageRating: 4.8,
      dimensions: { width: 180, height: 80, depth: 85 },
    },
    {
      _id: 'p2',
      name: 'Oversized Sectional',
      category: { _id: 'cat-sofa', name: 'Sofas' },
      price: 1500,
      inStock: 2,
      material: 'Velvet',
      colorOptions: ['emerald'],
      tags: ['living room'],
      averageRating: 4.5,
      dimensions: { width: 320, height: 110, depth: 120 },
    },
    {
      _id: 'p3',
      name: 'Oak Coffee Table',
      category: { _id: 'cat-table', name: 'Tables' },
      price: 350,
      inStock: 6,
      material: 'Oak',
      colorOptions: ['beige'],
      tags: ['living room'],
      averageRating: 4.7,
      dimensions: { width: 110, height: 45, depth: 60 },
    },
  ];

  beforeEach(async () => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(sampleProducts),
    };

    productModel = {
      find: jest.fn().mockReturnValue(chain),
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

  it('filters out products that cannot pass through doorwayWidth', async () => {
    const result = await service.fitMySpaceSearch(1, 10, {
      doorwayWidth: 90,
    });

    expect(result.products.map((p: any) => p._id)).toEqual(['p1', 'p3']);
    expect(result.pagination.total).toBe(2);
  });

  it('generates room bundles respecting budget, doorway, and 65% walkable footprint', async () => {
    const result = await service.generateRoomBundle({
      roomType: RoomType.LIVING_ROOM,
      budget: 1400,
      roomDimensions: { width: 300, depth: 300, height: 250 },
      doorwayWidth: 90,
      preferredMaterials: ['oak'],
      preferredColors: ['beige'],
      maxResults: 2,
    });

    expect(result.bundles.length).toBeGreaterThan(0);
    const topBundle = result.bundles[0];
    expect(topBundle.items.map((i: any) => i._id)).toEqual(['p1', 'p3']);
    expect(topBundle.totalPrice).toBe(1250);
    expect(topBundle.footprintCm2).toBeLessThanOrEqual(result.maxWalkableFootprintCm2);
  });
});
