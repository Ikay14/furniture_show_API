import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notifcation.service';

@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name);

  constructor(private readonly notificationsService: NotificationService) {}

  
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyVendorSummary() {
    this.logger.log('Running cron: Sending daily vendor summaries...');
    
    // You would query approved vendors here
    // const vendors = await this.vendorService.findApproved();
    // for (const vendor of vendors) {
    //   await this.notificationsService.notifyVendorApproval(vendor);
    // }
  }

  /**
   * Example: Check new products every 5 minutes and notify vendors
   */
  @Cron('*/5 * * * *')
  async checkNewProducts() {
    this.logger.log('Running cron: Checking for new products...');
    
    // Fetch newly added products in the last 5 min
    // const newProducts = await this.productService.findNew();
    // for (const product of newProducts) {
    //   await this.notificationsService.notifyNewProduct(product, product.vendor);
    // }
  }
}
