import { PartialType } from "@nestjs/mapped-types";
import { RegisterDto } from "./register.user.dto";
import { IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class UpdateUserProfile extends PartialType(RegisterDto){

    @IsString()
    @IsOptional()
    gender?: string

    @IsPhoneNumber()
    @IsOptional()
    phone?: number 

    @IsString()
    @IsOptional()
    dob?: string 

    @IsString()
    @IsOptional()
    firstName?: string 

    @IsString()
    @IsOptional()
    lastName?: string 

    @IsString()
    @IsOptional()
    address?: string 

}