import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class ApplyForVendorDto {
  @ApiProperty({ example: '1twhh-234erg-5678ee-90', description: 'Unique vendor ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  storeName: string;

  // @ApiProperty({ example: 'Jane Doe', description: 'Owner full name' })
  // @IsNotEmpty()
  // owner: object;

  @ApiProperty({ example: 'vendor@email.com', description: 'Vendor email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'retail', description: 'Business type' })
  @IsString()
  @IsNotEmpty()
  businessType: string;

  @ApiProperty({ example: 'RC123456', description: 'Business registration number', required: false })
  @IsString()
  @IsOptional()
  businessRegistrationNumber?: string;

  @ApiProperty({ example: '12345678901', description: 'National Identification Number', required: false })
  @IsString()
  @IsOptional()
  NIN?: string;

  @ApiProperty({ example: '123 Main St', description: 'Business address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Nigeria', description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Lagos', description: 'State' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Ikeja', description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '1234567890', description: 'Bank account number' })
  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @ApiProperty({ example: 'GTBank', description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: 'https://logo.url', description: 'Store logo URL', required: false })
  @IsOptional()
  storeLogo?: string;

  @ApiProperty({ example: 'https://banner.url', description: 'Store banner URL', required: false })
  @IsOptional()
  bannerImage?: string;

  @ApiProperty({ example: 'Best store for furniture', description: 'Store description', required: false })
  @IsString()
  description?: string;

}

