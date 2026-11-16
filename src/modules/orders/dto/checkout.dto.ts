import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @ApiProperty({ example: '14 Admiralty Way' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  state: string;
}

export class CheckoutDTO {
  @ApiProperty({
    example: ['65a1d7f8d4c6d83e1f7e3f5a'],
    description: 'Arrays of Ids of order',
  })
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  orderIds: string[];

  @ApiPropertyOptional({ type: ShippingAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({ example: true, description: 'Include white-glove assembly service' })
  @IsOptional()
  @IsBoolean()
  requiresAssembly?: boolean;
}
