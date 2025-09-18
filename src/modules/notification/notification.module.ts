import { Module } from '@nestjs/common';
import { Notification, NotificationSchema } from './model/notification.model';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationCron } from './notification.cron';
import { NotificationService } from '../notification/notifcation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [],
  providers: [NotificationCron, NotificationService],
  exports: [NotificationModule]
})
export class NotificationModule {}
