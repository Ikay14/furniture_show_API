import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RoomType {
  LIVING_ROOM = 'living_room',
  BEDROOM = 'bedroom',
  DINING = 'dining',
  OFFICE = 'office',
}

export class RoomDimensionsDto {
  @ApiProperty({ example: 400, description: 'Room width in cm' })
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  width: number;

  @ApiProperty({ example: 500, description: 'Room depth/length in cm' })
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  depth: number;

  @ApiProperty({ example: 260, description: 'Ceiling height in cm' })
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  height: number;
}

export class RoomBundleDto {
  @ApiProperty({ enum: RoomType, example: RoomType.LIVING_ROOM })
  @IsEnum(RoomType)
  roomType: RoomType;

  @ApiProperty({ example: 2500, description: 'Total budget' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  budget: number;

  @ApiProperty({ type: RoomDimensionsDto })
  @ValidateNested()
  @Type(() => RoomDimensionsDto)
  roomDimensions: RoomDimensionsDto;

  @ApiPropertyOptional({ example: 85, description: 'Doorway clearance width in cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  doorwayWidth?: number;

  @ApiPropertyOptional({ example: ['oak', 'linen'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredMaterials?: string[];

  @ApiPropertyOptional({ example: ['beige', 'walnut'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredColors?: string[];

  @ApiPropertyOptional({ example: 3, description: 'Number of bundle suggestions (1-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxResults?: number;
}
