import { Controller, Get, Query } from "@nestjs/common";
import { OrderManagementService } from "../services/order.management.service";
import { OrderStatus } from "src/modules/orders/model/order.model";

@Controller('admin-orders-mgt')
export class OrderManagementController {
    constructor(
        private orderManagementService: OrderManagementService
    ) {}

    @Get()
    async getOrders(
        @Query('isDelivered') isDelivered: boolean,
        @Query('isPaid') isPaid: boolean,
        @Query('status') status: string,
        @Query('page') page: number,
        @Query('limit') limit: number
    ) {
        return this.orderManagementService.getOrder(
            { isDelivered, isPaid, status },
            page,
            limit
        )
    }

    @Get('update-status')
    async updateOrderStatus(
        @Query('orderId') orderId: string,
        @Query('status') status: OrderStatus
    ) {
        return this.orderManagementService.updateOrderStatus(orderId, status)
    }
}