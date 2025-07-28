import { Type } from "class-transformer";
import { IsObject, IsString, ValidateNested, IsNumber } from "class-validator";

export class DimensionsDto {
  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  depth: number;
}


export class ProductDTO {
    @IsString()
    name: string;

    @IsString()
    category: string;
    
    @IsString()
    description_of_product: string;

    @IsString()
    price: string;

    @IsString()
    stock: string;

    @IsObject()
    @ValidateNested()
    @Type(() => DimensionsDto)
    dimensions: DimensionsDto;

}