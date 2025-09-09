import { Order } from "src/modules/orders/model/order.model";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrderStatus } from "src/modules/orders/model/order.model";

@Injectable()
export class OrderManagementService {
    constructor(
        @InjectModel(Order.name)
        private orderModel: Model<Order>
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

}