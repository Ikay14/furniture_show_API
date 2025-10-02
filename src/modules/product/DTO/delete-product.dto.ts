import {IsString, IsNotEmpty} from 'class-validator';

export class DeleteProductDTO {
    @IsString()
    productId: string;

    @IsString()
    vendorId: string;
}