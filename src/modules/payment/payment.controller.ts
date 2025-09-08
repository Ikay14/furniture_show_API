import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentDTO } from './DTO/payment.dto';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    constructor(
        private paymentService: PaymentService
    ){}

    @Post('initialize')
    @ApiOperation({ summary: 'Initialize a new payment' })
    @ApiBody({ type: PaymentDTO })
    @ApiResponse({ status: 201, description: 'Payment initialized successfully' })
    async initializePayment(@Body() paymentData: PaymentDTO) {
        return this.paymentService.initializePayment(paymentData);
    }

    @Get('verify/:ref')
    @ApiOperation({ summary: 'Verify a payment by reference' })
    @ApiParam({ name: 'ref', type: String, description: 'Payment reference' })
    @ApiResponse({ status: 200, description: 'Payment verified successfully' })
    async verifyPayment(@Param('ref') ref: string) {
        return this.paymentService.verifyPayment(ref);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Handle Paystack webhook events' })
    @ApiBody({ type: Object, description: 'Webhook payload from Paystack' })
    @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
    async handlePaystackWebhook(@Body() payload: any) {
        return this.paymentService.handlePaystackWebhook(payload);
    }
}

