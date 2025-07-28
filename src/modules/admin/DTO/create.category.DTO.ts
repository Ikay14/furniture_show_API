import { IsString } from "class-validator";

export class CreateCategoryDTO {
    @IsString()
    name: string;

    @IsString()
    description: string;
}