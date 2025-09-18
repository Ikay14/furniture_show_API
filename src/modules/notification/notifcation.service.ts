import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Notification } from "./model/notification.model";
import { Model } from "mongoose";
import { NotificationDTO } from "./DTO/create.notification.dto";
import { CreateNotificationRecipientDto } from "./DTO/recipient.dto";
import { MailService } from "src/services/email.service";
import { User } from "../user/model/user.model";
import { Vendor } from "../vendor/model/vendor.model";
import { Admin } from "../admin/model/admin.model";

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) 
        private notifyModel:Model<Notification>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
        @InjectModel(Admin.name) private adminModel: Model<Admin>,
        private mailService: MailService
    ){}

    async createNotification(notifyDto: NotificationDTO){
        const { recipient, message, notificationType } = notifyDto

        const notifyUser = await this.notifyModel.create({
            recipient, message, notificationType
        })

        if(!notifyUser) throw new BadRequestException('notification not created')
    
        // await this.getRecipient(recipient)  

        // await this.sendEmail(
        //      user.email, 
        //     `Welcome to ShopForYou! Verify Your Email`, 
        //     'welcome', 
        //     { name: user.firstName || 'User', email: user.email, otp }
        // )
        return {
            msg: 'notificatin created',
            notifyUser
        }
    }

    async markAsRead(notificatinId:string){
        const getNotification = await this.notifyModel.findByIdAndUpdate(
            notificatinId,
        { read: true }, { new: true  })

        if(!getNotification) throw new NotFoundException('notification not found')

        return {
            msg: 'notification read',
            getNotification
        }
    }

    async getUserNotification(userId: string, page: number, limit: number, status: string ){

        const filter: any = { userId }

        if (status) filter.read = status === 'read';

        const notification = await this.notifyModel
        .find(filter)
        .skip((page - 1 ) * limit)
        .limit(limit)
        .sort({ createdAt: -1})
        .lean()

        if(!notification) throw new NotFoundException('notification not found')

        return {
            success: true,
            count: notification.length,
            page,
            limit,
            data: notification,
        }
    }

    async markAllAsRead(userId: string) {
    return this.notifyModel.updateMany({ userId, read: false }, { $set: { read: true } });
    }

    async getRecipient(recipientDto: CreateNotificationRecipientDto) {
        const {recipientModel, recipientId } = recipientDto

        let recipientEmail: string | null = null;

        if (recipientModel === 'User') {
        const user = await this.userModel.findById(recipientId);
        recipientEmail = user?.email ?? null;
        } else if (recipientModel === 'Vendor') {
        const vendor = await this.vendorModel
        .findById(recipientId)
        .populate('owner', 'email');
        recipientEmail = vendor?.email ?? vendor?.owner?.email ?? null;
    } else if (recipientModel === 'Admin') {
        const admin = await this.adminModel.findById(recipientId);
        recipientEmail = admin?.email ?? null;
    }

    return recipientEmail;
    }


    private async sendEmail(to: string, subject: string, templateName: string, data: Record<string, string> ): Promise<void> {
    await this.mailService.sendMailWithTemplate(to, subject, templateName, data);
    }

}