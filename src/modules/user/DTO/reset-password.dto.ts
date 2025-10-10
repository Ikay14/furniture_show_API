import { ApiProperty } from "@nestjs/swagger" 
import { IsString } from "class-validator"   

export class ResetPasswordDTO { 
    @ApiProperty({
        description: 'new user password',
        example: 'userStrongPassword1$'
        })
    @IsString()

    password: string
    @ApiProperty({
        description: 'confirm user password',
        example: 'userStrongPassword1$'
        })
    @IsString()
    confirmPassword: string

    }