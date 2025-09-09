import { PartialType } from "@nestjs/mapped-types";
import { ApplyForVendorDto } from "./apply.vendor.dto"; 
import { IsString } from "class-validator";

export class UpdateApplyVendorDto extends PartialType(ApplyForVendorDto) {
    @IsString()
    vendorId: string
}