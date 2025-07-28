import { IsString } from "class-validator";
import { CreateCategoryDTO } from "./create.category.DTO";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateCategoryDTO extends PartialType(CreateCategoryDTO) {
    @IsString()
    _id: string;
}

