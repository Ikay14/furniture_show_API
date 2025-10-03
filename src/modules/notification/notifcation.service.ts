import { Injectable } from "@nestjs/common";
import { EventQueue } from "../events/event.queue";


@Injectable()
export class NotificationService {
    constructor( private eventQueue: EventQueue,
  ) {}

    async sendWelcomeEmail(user: { email: string; firstName?: string; otp: string }) {
        await this.eventQueue.sendNotification('WELCOME_EMAIL', {
        type: 'WELCOME_EMAIL',
        to: user.email,
        subject: `Welcome to ShopForYou! Verify Your Email`,
        data: { name: user.firstName, otp: user.otp },
        channel: ['EMAIL'],
    }, { delay: 5000, priority: 5 }) 
  }

    async sendOTP(user: { email: string; firstName?: string; otp: string }) {
        await this.eventQueue.sendNotification('REQUEST_OTP', {
        type: 'REQUEST_OTP',
        to: user.email,
        subject: `You requested a One-Time Password`,
        data: { name: user.firstName, otp: user.otp },
        channel: ['EMAIL'],
    }, { delay: 5000, priority: 3 }) 
  }

    async sendForgotPassword(user: { email: string; otp: string }) {
        await this.eventQueue.sendNotification('FORGoT_PASSWORD', {
        type: 'FORGOT_PASSWORD',
        channel: ['EMAIL'],
        to: user.email,
        subject: 'Reset your password',
        data: { otp: user.otp },
    }, { delay: 5000, priority: 1 })
  }

    async sendVendorApproval(vendor: { email: string; vendorName: string, status?: string }) {
        await this.eventQueue.sendNotification('VENDOR_APPROVAL',{
        type: 'VENDOR_APPROVAL',
        channel: ['EMAIL', 'APP'],
        to: vendor.email,
        subject: 'Vendor Approved!',
        data: { vendor: vendor.vendorName, status: vendor.status },
    }, { delay: 5000, priority: 3 })
}

    async sendNewProductNotification(product: { name: string; email: string; vendorName: string  }) {
        await this.eventQueue.sendNotification('PRODUCT_CREATED', {
        type: 'PRODUCT_CREATED',
        channel: ['EMAIL', 'APP'],
        to: product.email,
        subject: 'New Product Added!',
        data: { product: product.name, vendor: product.vendorName },
    }, { delay: 5000, priority: 2 })
  }

}
