import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CheckoutDTO {
      // @ApiProperty({ example : "64a4da-wh948h0-wf5444-7u8f", description: "id of the user making the request"})
      // @IsString()
      // userId: string
      
      @ApiProperty({ example: ["c564a4da-4ba8-441f-8d20", "441f-8d20-64a4da-uw944", "64a4da-gfw849-f44382"], description: 'Arrays of Ids of order' })
      @IsArray()
      @IsString({ each: true })
      @Type(() => String)
      orderIds: string[];
}