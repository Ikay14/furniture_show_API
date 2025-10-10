import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FORGOT_PASSWORD_DTO{
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'john.doe@example.com'
        })
    @IsString()
    email: string

}
