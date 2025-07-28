import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post('create-order')
    async createOrder(
        @Req() req,
        @Body('cartId') cartId: string){
        const userId = req.user.id
        return this.ordersService.createOrder(userId, cartId)
    }

    @Get(':id')
    async getAllOrders(
        @Param('id') id: string
    ) {
        return this.ordersService.getUserOrders(id)
    }
}
