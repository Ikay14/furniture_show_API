import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Escrow, EscrowSchema } from './model/escrow.model';
import { Vendor, VendorSchema } from '../vendor/model/vendor.model';
import { Order, OrderSchema } from '../orders/model/order.model';
import { EscrowService } from './escrow.service';
import { PayoutProcessor } from './payout.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Escrow.name, schema: EscrowSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    BullModule.registerQueue({ name: 'payouts' }),
  ],
  providers: [EscrowService, PayoutProcessor],
  exports: [EscrowService],
})
export class EscrowModule {}
