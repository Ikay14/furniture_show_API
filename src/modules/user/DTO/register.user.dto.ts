import { IsEmail, IsString, IsStrongPassword } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'john.doe@example.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The user\'s unique username',
        example: 'johndoe'
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'The user\'s strong password',
        example: 'P@ssw0rd123!'
    })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    password: string;
}
