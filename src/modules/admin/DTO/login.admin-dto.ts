import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDTO {
    @ApiProperty({ example: 'admin123@gmail.com', description: 'Admin email' })
    @IsString()
    email: string;

    @ApiProperty({ example: 'admin#123', description: 'Admin password' })
    @IsString()
    password: string;
}
