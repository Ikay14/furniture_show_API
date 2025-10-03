import { IsString, IsNumber, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}