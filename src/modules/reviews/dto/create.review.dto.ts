import { IsString, IsNumber, Min, Max } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d123', description: 'Product ID being reviewed' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Great product!', description: 'Review comment' })
  @IsString()
  comment: string;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}