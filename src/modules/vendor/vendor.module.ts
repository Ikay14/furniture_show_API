import { Module } from '@nestjs/common';
import { VendorController } from './controllers/vendor.auth.controller';
import { VendorService } from './services/vendor.auth.service';

@Module({
  controllers: [VendorController],
  providers: [VendorService]
})
export class VendorModule {}
