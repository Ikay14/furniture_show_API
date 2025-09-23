import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { delay, Queue } from "bullmq";
import { NotificationPayload } from "../notification/notification.types";


export interface Mail {
    to: any,
    subject: string,
    templateName: any,
    data: Record<string, string>
}
@Injectable()
export class EventQueue {
    constructor(
        @InjectQueue('notification')
        private readonly notificationQueue: Queue
    ){}

    async sendNotification(
        type: string,
        payload: NotificationPayload,
        options: { delay?: number; priority?: number } = {}
    ) {
        await this.notificationQueue.add('notify', {
        type,
        channel: payload.channel || ['EMAIL'], 
        to: payload.to,
        subject: payload.subject,
        data: payload.data,
        }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        delay: options.delay || 0,
        priority: options.priority || 5,
    })
}

}