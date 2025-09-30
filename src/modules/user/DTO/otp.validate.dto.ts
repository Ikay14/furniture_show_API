import { IsString, IsNumber } from "class-validator";

export class ValidateDTO {
    @IsString()
    email: string

    @IsNumber()
    otp: number
} 