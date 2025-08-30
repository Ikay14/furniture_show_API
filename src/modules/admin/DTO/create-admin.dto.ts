import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CreateAdminDto {
    @ApiProperty({ example: 'admin123@gmail.com', description: 'Admin email' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'admin1', description: 'Admin username' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'admin#123', description: 'Admin password' })
    @IsStrongPassword()
    password: string;

}



    