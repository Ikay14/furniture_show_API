import { Controller, Get, Patch, Query, UnauthorizedException, UseGuards } from "@nestjs/common";
import { OrderManagementService } from "../services/order.management.service";
import { OrderStatus } from "src/modules/orders/model/order.model";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from "src/guards/jwt.guard";
import { Roles } from "src/decorators/roles.decorator";
import { GetUser } from "src/decorators/user.decorator";

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
        @GetUser('vendor') vendor: { _id?: string; id?: string },
        @Query('isDelivered') isDelivered: boolean,
        @Query('isPaid') isPaid: boolean,
        @Query('status') status: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const vendorId = String(vendor?._id ?? vendor?.id ?? '');
        if (!vendorId) throw new UnauthorizedException('Vendor profile not found');

        return this.orderManagementService.getOrder(
            vendorId,
            { isDelivered, isPaid, status },
            page,
            limit
        )
    }

    @Patch('update-status')
    @ApiOperation({ summary: 'Update the status of an order' })
    @ApiQuery({ name: 'orderId', required: true, type: String, description: 'Order ID' })
    @ApiQuery({ name: 'status', required: true, enum: OrderStatus, description: 'New order status' })
    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    async updateOrderStatus(
        @GetUser('vendor') vendor: { _id?: string; id?: string },
        @Query('orderId') orderId: string,
        @Query('status') status: OrderStatus
    ) {
        const vendorId = String(vendor?._id ?? vendor?.id ?? '');
        if (!vendorId) throw new UnauthorizedException('Vendor profile not found');

        return this.orderManagementService.updateOrderStatus(vendorId, orderId, status)
    }
}