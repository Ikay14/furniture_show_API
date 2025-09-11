import { PartialType } from "@nestjs/mapped-types";
import { ApplyForVendorDto } from "./apply.vendor.dto"; 
import { IsOptional, IsString } from "class-validator";

export class UpdateApplyVendorDto extends PartialType(ApplyForVendorDto) {
    @IsString()
    vendorId: string

   
    @IsOptional()
    bannerLogo?: string

   
    @IsOptional()
    storeLogo?: string
}