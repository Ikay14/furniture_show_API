import { IsNumber, Min, ValidateNested, IsArray, IsNotEmpty } from "class-validator";
import { Type } from 'class-transformer';
import { IsMongoId } from 'class-validator';

class ProductInCartDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}


export class CreateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductInCartDto)
  products: ProductInCartDto[]
}
