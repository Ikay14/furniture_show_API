import { Controller, Post, Get, Req, Param, Logger, ForbiddenException, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { EscrowService } from './escrow.service';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { authenticatePaystackSignature } from 'src/utils/verifyPaystackSignature';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { GetUser } from 'src/decorators/user.decorator';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name)
    constructor(
        private paymentService: PaymentService,
        private escrowService: EscrowService,
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

    @Get('escrow/vendor')
    @UseGuards(JwtAuthGuard)
    @Roles('vendor')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get escrow balances and payout history for the authenticated vendor' })
    async getVendorEscrow(@GetUser('vendor') vendor: { _id?: string; id?: string }) {
        const vendorId = String(vendor?._id ?? vendor?.id ?? '');
        if (!vendorId) throw new UnauthorizedException('Vendor profile not found');
        return this.escrowService.getVendorEscrowSummary(vendorId);
    }

    @Post('escrow/:orderId/release')
    @UseGuards(JwtAuthGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Release held escrow funds for a delivered order to the vendor' })
    async releaseOrderEscrow(@Param('orderId') orderId: string) {
        return this.escrowService.queueVendorPayout(orderId);
    }
}

