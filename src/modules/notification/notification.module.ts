import { Module } from '@nestjs/common';
import { Notification, NotificationSchema } from './model/notification.model';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { EventModule } from '../events/event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    EventModule
  ],
  controllers: [],
  providers: [ NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
