import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/add.cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

    @Post()
    async createCart(
        @Body() createCartDto: CreateCartDto, 
        @Req() req) {
        const userId = req.user.id
        return this.cartsService.createCart(createCartDto, userId);
    }
    
    @Get(':userId')
    async getUserCart(
        @Param('userId') userId: string) {
        return this.cartsService.getUserCart(userId)
    } 

}