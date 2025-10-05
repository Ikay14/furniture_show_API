import { IsString, IsNumber } from 'class-validator'

export class PaymentDTO {
    @IsNumber()
    amount: number;

    @IsString()
    orderId: string[]

    @IsString()
    customerId: string;

    @IsString()
    email: string;

}