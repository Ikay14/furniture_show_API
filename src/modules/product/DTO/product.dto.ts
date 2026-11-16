import { Type } from "class-transformer";
import { IsObject, IsString, ValidateNested, IsArray, IsOptional, IsNumber } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantDto {
  @ApiProperty({ example: 'SOFA-EMERALD-VELVET' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Emerald Velvet' })
  @IsString()
  colorName: string;

  @ApiPropertyOptional({ example: '#046307' })
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiPropertyOptional({ example: 'Velvet' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ example: 50, description: 'Price adjustment relative to base price' })
  @Type(() => Number)
  @IsNumber()
  priceDelta: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsNumber()
  inStock: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class DimensionsDto {
  @ApiProperty({ example: 50, description: 'Width of the product in centimeters' })
  @Type(() => Number)
  width: number;

  @ApiProperty({ example: 100, description: 'Height of the product in centimeters' })
  @Type(() => Number)
  height: number;

  @ApiProperty({ example: 30, description: 'Depth of the product in centimeters' })
  @Type(() => Number)
  depth: number;
}

export class ProductDTO {
  @ApiProperty({ example: 'Wooden Chair', description: 'Name of the product' })
  @IsString()
  name: string;

  @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d456', description: 'Category ID of the product' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'A comfortable wooden chair', description: 'Description of the product' })
  @IsString()
  description: string;

  @ApiProperty({ example: '120', description: 'Price of the product as a string' })
  @IsString()
  price: string;

  @ApiProperty({ example: '10', description: 'Stock quantity as a string' })
  @IsString()
  inStock: string;

  @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d123', description: 'Vendor ID of the product' })
  @IsString()
  vendorId: string;

  @ApiProperty({ example: ['red', 'green', 'brown'], description: 'Color options for the product' })
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  colorOptions: string[];

  @ApiProperty({ example: ["chair", "wooden", "furniture"], description: 'Tags of the products' })
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  tags: string[];

  @ApiProperty({ type: DimensionsDto, description: 'Dimensions of the product' })
  @IsObject()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;

  @ApiPropertyOptional({ type: [ProductVariantDto], description: 'Optional swatch/material SKU variants' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}