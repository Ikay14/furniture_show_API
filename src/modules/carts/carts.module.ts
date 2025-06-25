import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';

@Module({
  providers: [CartsService],
  controllers: [CartsController]
})
export class CartsModule {}
