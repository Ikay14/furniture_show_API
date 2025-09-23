import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { EventQueue } from "./event.queue";
import { EmailProcessor } from "./event.processor";
import { MailService } from "src/services/email.service";
import { User, UserSchema } from "../user/model/user.model";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationCron } from "./cron.jobs";
import { Notification, NotificationSchema } from "../notification/model/notification.model";

@Module({
    imports: [
        MongooseModule.forFeature(
            [
            { name: User.name, schema: UserSchema },
            { name: Notification.name, schema: NotificationSchema }
            ]),
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                // db: 1
            }
        }),
        BullModule.registerQueue(
            { name: "notification" }
        )
    ],
    controllers: [],
    providers: [EventQueue, EmailProcessor, MailService, NotificationCron],
    exports: [EventQueue]
})

export class EventModule {}