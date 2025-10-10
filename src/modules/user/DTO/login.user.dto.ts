import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDTO {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'john.doe@example.com'
        })
    @IsString()
    email: string

    @ApiProperty({
        description: 'The user\'s strong password',
        example: 'P@ssw0rd123!'
    })
    @IsString()
    password: string
}