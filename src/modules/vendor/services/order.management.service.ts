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

    async getOrder(
        vendorId: string,
        filter: { isDelivered?: boolean, isPaid?: boolean, status?: string }, 
        page = 1,
        limit = 10
    ): Promise<{ msg: string, order: Order[] }> {

        const query: Record<string, any> = { vendor: vendorId }
        if (filter.isDelivered !== undefined) {
            query['isDelivered'] = filter.isDelivered;
        }
        if (filter.isPaid !== undefined) {
            query['isPaid'] = filter.isPaid;
        }
        if (filter.status !== undefined) {
            query['status'] = filter.status;
        }
        
        const order = await this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

        return {
            msg: 'All order returned',
            order
        }
    }

    async updateOrderStatus(vendorId: string, orderId: string, status: OrderStatus
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

    const order = await this.orderModel.findOneAndUpdate(
      { _id: orderId, vendor: vendorId },
      updateFields,
      { new: true },
    );

    if (!order) {
    throw new BadRequestException(`Order not found with ID: ${orderId}`)
    }

    return {
    msg: 'Order status updated',
    order,
    }
}

}