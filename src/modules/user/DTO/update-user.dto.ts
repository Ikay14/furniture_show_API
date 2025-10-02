import { PartialType } from "@nestjs/mapped-types";
import { RegisterDto } from "./register.user.dto";
import { IsPhoneNumber, IsString } from "class-validator";

export class UpdateUserProfile extends PartialType(RegisterDto){
    @IsString()
    userId: string

    @IsString()
    gender?: string

    @IsPhoneNumber()
    phone?: number 

    @IsString()
    firstName?: string 

    @IsString()
    lastName?: string 

    @IsString()
    address?: string 

    @IsString()
    picture?: string
}