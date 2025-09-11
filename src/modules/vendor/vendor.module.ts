import { Module } from '@nestjs/common';
import { ProductManagementController } from './controllers/product-management.controller';
import { ProductManagementService } from './services/product-management.service';
import { OrderManagementController } from './controllers/order-management.controller';
import { OrderManagementService } from './services/order.management.service';
import { ApplyForVendorService } from './services/apply.vendor.service';
import { ApplyForVendorController } from './controllers/apply.vendor.controller';

@Module({
  controllers: [ProductManagementController, OrderManagementController, ApplyForVendorController],
  providers: [ProductManagementService, OrderManagementService, ApplyForVendorService]
})
export class VendorModule {}
