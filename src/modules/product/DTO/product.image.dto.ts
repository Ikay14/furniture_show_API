import { IsString } from "class-validator";

export class ProductImageDto {

    @IsString()
    productId: string

    @IsString()
    adminId: string

    @IsString()
    image: string[];

    file: Express.Multer.File;
}