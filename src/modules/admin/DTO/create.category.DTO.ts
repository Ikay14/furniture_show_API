import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategoryDTO {
    @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d123', description: 'admin ID creating the category' })
    @IsString()
    adminId: string;

    @ApiProperty({ example: 'Furniture', description: 'Category name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'All kinds of furniture', description: 'Category description' })
    @IsString()
    description: string;
} 