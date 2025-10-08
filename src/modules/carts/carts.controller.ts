import { Controller, Post, Get, Param, Body, Delete, UseGuards, Patch } from '@nestjs/common';
import { CartService } from './carts.service';
import { CreateCartDto } from './dto/add.cart.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { GetUser } from 'src/decorators/user.decorator';



@ApiTags('Carts') // Groups all cart-related endpoints
@ApiBearerAuth() // Indicates JWT authentication required
@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartService) {}

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
    @GetUser('id') userId: string
  ) {
    return this.cartsService.addToCart(userId, createCartDto);
  }

  @Get('me')
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
    @GetUser('id') userId: string,
  ) {
    return this.cartsService.getCart(userId)
  }

  @Patch(':productId/remove-cart') 
  async deleteUserCart(
    @GetUser('id') userId:string,
    @Param('productId') productId: string
  ) {
    return this.cartsService.removeFromCart(userId, productId);
  }

  @Delete('clear-cart')
  async clearCart(
    @GetUser('id') userId:string,
    @Param('cartId') productId: string
  ) {
    return this.cartsService.clearCart(userId)
  }
}