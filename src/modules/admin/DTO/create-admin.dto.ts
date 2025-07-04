import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CreateAdminDto {

    @IsEmail()
    email: string;

    @IsString()
    username: string;

    @IsStrongPassword()
    password: string;

}



    