import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/add.cart.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Carts') // Groups all cart-related endpoints
@ApiBearerAuth() // Indicates JWT authentication required
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new cart',
    description: 'Creates a shopping cart for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Cart successfully created',
    type: CreateCartDto, // Assuming you have this DTO defined
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiBody({
    type: CreateCartDto,
    description: 'Cart creation data',
  })
  async createCart(
    @Body() createCartDto: CreateCartDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.cartsService.createCart(createCartDto, userId);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get user cart',
    description: 'Retrieves the shopping cart for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user whose cart to retrieve',
    example: '507f1f77bcf86cd799439011',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User cart retrieved successfully',
    // type: CartResponseDto, // Recommended: Create a response DTO
  })
  @ApiResponse({
    status: 404,
    description: 'User or cart not found',
  })
  async getUserCart(
    @Param('userId') userId: string,
  ) {
    return this.cartsService.getUserCart(userId);
  }
}