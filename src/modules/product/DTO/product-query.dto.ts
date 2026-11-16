import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductSortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING = 'rating',
  NEWEST = 'newest',
}

export class FilterListDto {
  @ApiPropertyOptional({ example: 'Sofa' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: '64b8c2f1e2a1c7a1f8e9d456' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 220, description: 'Max width in cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxWidth?: number;

  @ApiPropertyOptional({ example: 110, description: 'Max height in cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxHeight?: number;

  @ApiPropertyOptional({ example: 100, description: 'Max depth in cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxDepth?: number;

  @ApiPropertyOptional({
    example: 80,
    description: 'Doorway/hallway width in cm (at least 2 product axes must fit)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  doorwayWidth?: number;

  @ApiPropertyOptional({ example: 'oak' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 'emerald' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: ['modern', 'minimalist'], type: [String] })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((v) => v.trim()).filter(Boolean)
      : value,
  )
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ProductSortBy })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy;
}
