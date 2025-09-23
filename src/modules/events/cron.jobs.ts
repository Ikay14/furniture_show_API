import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notifcation.service';
import { User } from '../user/model/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'

@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name)

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  
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
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkNewProducts() {
    this.logger.log('Running cron: Checking for new products...');
    
    // Fetch newly added products in the last 5 min
    // const newProducts = await this.productService.findNew();
    // for (const product of newProducts) {
    //   await this.notificationsService.notifyNewProduct(product, product.vendor);
    // }
  }


  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteOtp(){
    this.logger.log('Running cron: Deleting expired OTPs...');
    await this.userModel.deleteMany({ otpExpiry: { $lt: new Date() } });
    this.logger.log('Expired OTPs deleted');
  }


  @Cron(CronExpression.EVERY_5_MINUTES)
  async deleteUnverifiedUsers(){
    this.logger.log('Running cron: Deleting unverified users...');
    await this.userModel.deleteMany({ isVerified: false });
    this.logger.log('Unverified users deleted');
  }
}
