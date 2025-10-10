import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class ValidateDTO {
    @ApiProperty({
    description: 'The user\'s email address',
    example: 'john.doe@example.com'
    })
    @IsString()
    email: string

    @ApiProperty({
    description: 'Otp sent to user ',
    example: '488197'
    })
    @IsNumber()
    otp: string
} 

