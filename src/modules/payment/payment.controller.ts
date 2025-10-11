import { Controller, Post, Get, Req, Param,Logger, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { authenticatePaystackSignature } from 'src/utils/verifyPaystackSignature';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name)
    constructor(
        private paymentService: PaymentService
    ){}

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
    async handlePaystackWebhook(@Req() req: Request) {
        const isAuthenticated = authenticatePaystackSignature(req)
        if(!isAuthenticated) throw new ForbiddenException('Invalid Paystack Signature')

            const  event  = req.body
            const { reference } = event.data

            switch (event.event) {
                case 'charge.success':
                    await
            this.paymentService.verifyPayment(reference);
                    break

                case 'charge.failed':
                    await
            this.paymentService.handleFailedPayment(reference);
                    break
                
                default:
                    this.logger.log(`unhandled Paystack event: ${event.event}`)
                    break
            }
            return { received: true }         
    }
}

