import { Order, OrderStatus, ProductionStage } from "src/modules/orders/model/order.model";
import { BadRequestException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CloudinaryService } from "src/services/cloudinary.service";
import { NotificationService } from "src/modules/notification/notification.service";
import { RecordMilestoneDto } from "../DTO/milestone.dto";

const STAGE_ORDER: ProductionStage[] = [
    ProductionStage.DESIGN_CONFIRMED,
    ProductionStage.IN_CARPENTRY,
    ProductionStage.UPHOLSTERY_FINISHING,
    ProductionStage.QUALITY_CHECK,
    ProductionStage.OUT_FOR_DELIVERY,
];

@Injectable()
export class OrderManagementService {
    constructor(
        @InjectModel(Order.name)
        private orderModel: Model<Order>,
        @Optional() private cloudinaryService?: CloudinaryService,
        @Optional() private notificationService?: NotificationService,
    ) {}

    async getOrder( filter: { isDelivered?: boolean, isPaid?: boolean, status?: string }, 
        page, limit): Promise<{ msg: string, order: Order[] }> {

        const query = {}
        if (filter.isDelivered !== undefined) {
            query['isDelivered'] = filter.isDelivered;
        }
        if (filter.isPaid !== undefined) {
            query['isPaid'] = filter.isPaid;
        }
        if (filter.status !== undefined) {
            query['status'] = filter.status;
        }
        
        const order = await this.orderModel.find()
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

        return {
            msg: 'All order returned',
            order
        }
    }

    async updateOrderStatus(orderId: string, status: OrderStatus
    ): Promise<{ msg: string; order: Order }> {
        
    const updateFields: any = { status }

  // Update other fields conditionally
    if (status === OrderStatus.COMPLETED) {
    updateFields.isDelivered = true
    updateFields.deliveredAt = new Date()
    } else if (status === OrderStatus.CANCELLED) {
    updateFields.isPaid = false
    updateFields.isDelivered = false
    } else if (status === OrderStatus.PROCESSING) {
    updateFields.isPaid = true
    updateFields.isDelivered = false
    }

    const order = await this.orderModel.findByIdAndUpdate(orderId, updateFields, {
    new: true,
    });

    if (!order) {
    throw new BadRequestException(`Order not found with ID: ${orderId}`)
    }

    return {
    msg: 'Order status updated',
    order,
    }
}

    async recordOrderMilestone(
        vendorId: string,
        orderId: string,
        dto: RecordMilestoneDto,
        photos: Express.Multer.File[] = [],
    ): Promise<{ msg: string; order: Order }> {
        const order = await this.orderModel
            .findOne({ _id: orderId, vendor: vendorId })
            .populate('user', 'email firstName lastName');

        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found for vendor`);
        }

        const existingMilestones = order.milestones || [];
        if (existingMilestones.length > 0) {
            const lastStage = existingMilestones[existingMilestones.length - 1].stage;
            if (STAGE_ORDER.indexOf(dto.stage) <= STAGE_ORDER.indexOf(lastStage)) {
                throw new BadRequestException(
                    `Invalid milestone transition from ${lastStage} to ${dto.stage}`,
                );
            }
        }

        let photoUrls: string[] = [];
        if (photos.length > 0 && this.cloudinaryService) {
            const uploads = await Promise.all(
                photos.map((p) => this.cloudinaryService!.uploadFile(p, 'order-milestones', 'image')),
            );
            photoUrls = uploads.map((u) => u.secure_url);
        }

        const milestone = {
            stage: dto.stage,
            notes: dto.notes,
            photoUrls,
            completedAt: new Date(),
            updatedBy: vendorId,
        };

        order.milestones = [...existingMilestones, milestone];
        await order.save();

        const user = order.user as any;
        if (this.notificationService && user?.email) {
            await this.notificationService.sendOrderMilestoneUpdate({
                email: user.email,
                customerName: user.firstName || user.lastName || 'Customer',
                orderId: order.orderId,
                stage: dto.stage,
                notes: dto.notes,
                photoUrls,
            });
        }

        return {
            msg: 'Order milestone recorded',
            order,
        };
    }

}