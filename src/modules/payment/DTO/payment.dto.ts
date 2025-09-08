import { IsString, IsNumber } from 'class-validator'

export class PaymentDTO {
    @IsString()
    txRef: string;

    @IsString()
    reference: string;

    @IsNumber()
    amount: number;

    @IsString()
    orderId: string;

    @IsString()
    customerId: string;

    @IsString()
    paymentDate: string;

    @IsString()
    email: string;

    @IsString()
    paymentMethod: string;

    @IsString()
    currency: string;

    @IsString()
    gatewayResponse: string;

    @IsString()
    errorMessage: string;

    @IsString()
    isRefunded: string;

    @IsString()
    refundReference: string;
}