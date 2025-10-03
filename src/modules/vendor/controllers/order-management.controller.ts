import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { OrderManagementService } from "../services/order.management.service";
import { OrderStatus } from "src/modules/orders/model/order.model";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from "src/guards/jwt.guard";
import { Roles } from "src/decorators/roles.decorator";

@ApiTags('vendor Orders Management')
@Controller('vendor-orders-mgt')
@UseGuards(JwtAuthGuard)
@Roles('vendor')
export class OrderManagementController {
    constructor(
        private orderManagementService: OrderManagementService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get orders with optional filters and pagination' })
    @ApiQuery({ name: 'isDelivered', required: false, type: Boolean, description: 'Filter by delivery status' })
    @ApiQuery({ name: 'isPaid', required: false, type: Boolean, description: 'Filter by payment status' })
    @ApiQuery({ name: 'status', required: false, type: String, description: 'Order status' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of orders per page' })
    @ApiResponse({ status: 200, description: 'Orders fetched successfully' })
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
    @ApiOperation({ summary: 'Update the status of an order' })
    @ApiQuery({ name: 'orderId', required: true, type: String, description: 'Order ID' })
    @ApiQuery({ name: 'status', required: true, enum: OrderStatus, description: 'New order status' })
    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    async updateOrderStatus(
        @Query('orderId') orderId: string,
        @Query('status') status: OrderStatus
    ) {
        return this.orderManagementService.updateOrderStatus(orderId, status)
    }
}