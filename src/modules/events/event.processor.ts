import { Processor } from "@nestjs/bullmq";
import { MailService } from "src/services/email.service";
import { WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { NotificationPayload  } from "../notification/notification.types";
import { notificationTemplates } from "../notification/notification.templates";
import { InjectModel } from "@nestjs/mongoose";
import { Notification } from "../notification/model/notification.model";
import { Model } from "mongoose";
import { Logger } from "@nestjs/common";



@Processor('notification')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  constructor(
    private readonly mailService: MailService,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {
    super()
  }

  async process(job: Job<NotificationPayload>): Promise<any> {
    const { type, channel, to, data } = job.data;

    const config = notificationTemplates[type];

    if (!config) {
      this.logger.warn(`No configuration found for notification type: ${type}`);
      return;
    }

    this.logger.log(`Processing job: ${type} for ${to} via ${channel}`);

        if (channel.includes('EMAIL') && config.template) {
          await this.mailService.sendMailWithTemplate(
            to,
            config.subject,
            config.template,
            data
          )
          this.logger.log(`✉️ Email sent to ${to} using template ${config.template}`);
        }


        if (channel.includes('APP')) { 
          await this.sendAppNotification(to, data);
        }
  }


  private async sendAppNotification(to: string, data: any) {
    console.log(`📱 Sending app notification to ${to}`, data);
    // Save to MongoDB or push via WebSocket/FCM
    return await this.notificationModel.create(
      {
        recipient: to,
        type: data.type,
        message: data.message,
        read: false
      }
    )
    
  }
}

