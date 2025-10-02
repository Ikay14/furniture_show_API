import { IsOptional } from "class-validator";

export class FilterListDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  minPrice?: number;

  @IsOptional()
  maxPrice?: number;

  @IsOptional()
  category?: string;
}
