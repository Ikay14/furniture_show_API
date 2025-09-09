import { IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ProductImageDto {

    @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d123', description: 'Product ID' })
    @IsString()
    productId: string;

    @ApiProperty({ example: 'vendor123', description: 'Vendor ID' })
    @IsString()
    vendorId: string;

    @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], description: 'Array of image URLs or filenames', type: [String] })
    @IsString({ each: true })
    image: string[];

    @ApiProperty({ type: 'string', format: 'binary', description: 'Image file upload (single file)' })
    file: Express.Multer.File;
}