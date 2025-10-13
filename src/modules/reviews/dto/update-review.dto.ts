import { PartialType } from "@nestjs/mapped-types";
import { CreateReviewDto } from "./create.review.dto";
import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateReviewDTO extends PartialType(CreateReviewDto){
    @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d123', description: 'Review ID being updated' })
    @IsString()
    reviewId: string

    @ApiProperty({ example: '64b8c2f1e2a1c7a1f8e9d123', description: 'UserID' })
    @IsString()
    userId: string


}