import { PartialType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";
import { ProductDTO } from "./product.dto";

export class UpdateDTO extends PartialType(ProductDTO){
    @IsString()
    adminId: string

    @IsString()
    productId: string
}