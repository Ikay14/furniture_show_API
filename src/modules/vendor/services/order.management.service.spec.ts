import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrderManagementService } from './order.management.service';
import { Order, ProductionStage } from 'src/modules/orders/model/order.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { NotificationService } from 'src/modules/notification/notification.service';

describe('OrderManagementService - Custom Carpentry Milestones', () => {
  let service: OrderManagementService;
  let orderModel: any;
  let notificationService: any;
  let cloudinaryService: any;

  beforeEach(async () => {
    orderModel = {
      findOne: jest.fn(),
    };
    notificationService = {
      sendOrderMilestoneUpdate: jest.fn().mockResolvedValue(undefined),
    };
    cloudinaryService = {
      uploadFile: jest.fn().mockResolvedValue({ secure_url: 'https://cdn.example/frame.jpg' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderManagementService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: CloudinaryService, useValue: cloudinaryService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<OrderManagementService>(OrderManagementService);
  });

  it('records milestone, uploads progress photo, and notifies customer', async () => {
    const orderDoc = {
      _id: 'ord-1',
      orderId: 'ORD-100',
      vendor: 'vendor-1',
      user: { email: 'buyer@test.com', firstName: 'Ada' },
      milestones: [{ stage: ProductionStage.DESIGN_CONFIRMED, completedAt: new Date() }],
      save: jest.fn().mockResolvedValue(true),
    };

    orderModel.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(orderDoc),
    });

    const result = await service.recordOrderMilestone(
      'vendor-1',
      'ord-1',
      { stage: ProductionStage.IN_CARPENTRY, notes: 'Oak frame joined' },
      [{ originalname: 'frame.jpg', buffer: Buffer.from('img') } as any],
    );

    expect(result.order.milestones).toHaveLength(2);
    expect(result.order.milestones![1].photoUrls).toEqual(['https://cdn.example/frame.jpg']);
    expect(notificationService.sendOrderMilestoneUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'buyer@test.com',
        stage: ProductionStage.IN_CARPENTRY,
      }),
    );
  });

  it('rejects backward or duplicate stage transitions', async () => {
    const orderDoc = {
      _id: 'ord-1',
      vendor: 'vendor-1',
      milestones: [{ stage: ProductionStage.QUALITY_CHECK, completedAt: new Date() }],
    };

    orderModel.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(orderDoc),
    });

    await expect(
      service.recordOrderMilestone('vendor-1', 'ord-1', {
        stage: ProductionStage.IN_CARPENTRY,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
