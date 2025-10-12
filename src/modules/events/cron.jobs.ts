import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/model/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'


@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name)

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  
  @Cron(CronExpression.EVERY_10_MINUTES)
  async invalidateOtp(){
    this.logger.log('Running cron: Invalidate unused OTPs...');
    await this.userModel.deleteMany({ otpExpiry: { $lt: new Date() } });
    this.logger.log('OTPs Invalidated');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteOtp(){
    this.logger.log('Running cron: Deleting Expired OTPs...');
    await this.userModel.deleteMany({ otpExpiry: { $lt: new Date() } });
    this.logger.log('Expired OTPs deleted');
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async deleteUnverifiedUsers(){
    this.logger.log('Running cron: Deleting unverified users...')
    await this.userModel.deleteMany({ isVerified: false })
    this.logger.log('Unverified users deleted')
  }
}
