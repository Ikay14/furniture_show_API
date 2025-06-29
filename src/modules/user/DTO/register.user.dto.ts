import { strict } from "assert";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class RegisterDto {

    @IsEmail()
    email: String

    @IsString()
    username: String

    @IsStrongPassword()
    password: String

}