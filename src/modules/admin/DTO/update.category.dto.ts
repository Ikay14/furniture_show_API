import { IsString } from "class-validator";
import { CreateCategoryDTO } from "./create.category.DTO";
import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCategoryDTO extends PartialType(CreateCategoryDTO) {
    @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d123', description: 'Category ID' })
    @IsString()
    categoryId: string;
}

