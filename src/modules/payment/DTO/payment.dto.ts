import { IsString, IsNumber, IsArray } from 'class-validator'
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export class PaymentDTO {
    @IsNumber()
    amount: number;

          
    @ApiProperty({ example: ["c564a4da-4ba8-441f-8d20", "441f-8d20-64a4da-uw944", "64a4da-gfw849-f44382"], description: 'Arrays of Ids of order' })
    @IsArray()
    @IsString({ each: true })
    @Type(() => String)
    orderIds: string[];

    @ApiProperty({ example: "c564a4da-4ba8-441f-8d20", description: 'The id of the user' })
    @IsString()
    customerId: string;

    @IsString()
    email: string;

}