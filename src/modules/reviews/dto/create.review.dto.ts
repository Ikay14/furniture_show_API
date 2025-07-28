import { IsString } from "class-validator";

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsString()
  comment: string

  rating: number
}