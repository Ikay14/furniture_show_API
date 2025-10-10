import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RegisterDto } from "./register.user.dto";
import { IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class UpdateUserProfile extends PartialType(RegisterDto) {
    @ApiPropertyOptional({
        description: 'The user\'s gender',
        example: 'Male'
    })
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiPropertyOptional({
        description: 'The user\'s phone number',
        example: '5551234567'
    })
    @IsPhoneNumber()
    @IsOptional()
    phone?: number;

    @ApiPropertyOptional({
        description: 'The user\'s date of birth (e.g., "YYYY-MM-DD")',
        example: '1990-01-01'
    })
    @IsString()
    @IsOptional()
    dob?: string;

    @ApiPropertyOptional({
        description: 'The user\'s first name',
        example: 'John'
    })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional({
        description: 'The user\'s last name',
        example: 'Doe'
    })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional({
        description: 'The user\'s address',
        example: '123 Main St, Anytown, USA'
    })
    @IsString()
    @IsOptional()
    address?: string;
}
