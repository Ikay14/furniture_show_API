import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GetUser } from 'src/decorators/user.decorator';

@ApiTags('Orders') // Groups all order-related endpoints
@ApiBearerAuth() // Indicates this controller requires authentication
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create-order')
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates an order from a user\'s cart',
  })
  @ApiResponse({
    status: 201,
    description: 'Order successfully created',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not logged in',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiBody({
    description: 'Cart ID to create order from',
    schema: {
      type: 'object',
      properties: {
        cartId: {
          type: 'string',
          example: '65a1d7f8d4c6d83e1f7e3f5a',
          description: 'ID of the cart to convert to order',
        },
      },
    },
  })
  async createOrder(
    @GetUser() userId: string,
    @Body('cartId') cartId: string) {
    return this.ordersService.createOrders(userId, cartId)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user orders',
    description: 'Retrieves all orders for a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to fetch orders for',
    example: '65a1d7f8d4c6d83e1f7e3f5a',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getAllOrders(@Param('id') id: string) {
    return this.ordersService.getUserOrders(id);
  }
}