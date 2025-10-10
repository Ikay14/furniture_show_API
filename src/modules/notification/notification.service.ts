import { Injectable, Logger } from "@nestjs/common";
import { EventQueue } from "../events/event.queue";
import { UserOrderNotificationData } from "./DTO/order.details";


@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
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

    async sendForgotPasswordRequest(user: { name?: string, email: string; otp: string }) {
        await this.eventQueue.sendNotification('REQUEST_PASSWORD_OTP', {
        type: 'REQUEST_PASSWORD_OTP',
        to: user.email,
        subject: 'Reset your password',
        data: { otp: user.otp },
        channel: ['EMAIL'],
    }, { delay: 5000, priority: 1 })
  }

    async sendVendorApproval(vendor: { email: string; vendorName: string, status?: string }) {
        await this.eventQueue.sendNotification('VENDOR_APPROVAL',{
        type: 'VENDOR_APPROVAL',
        to: vendor.email,
        subject: 'Vendor Approved!',
        data: { vendor: vendor.vendorName, status: vendor.status },
        channel: ['EMAIL', 'APP'],
    }, { delay: 5000, priority: 3 })
}

    async sendNewProductNotification(product: { name: string; email: string; vendorName: string  }) {
        await this.eventQueue.sendNotification('PRODUCT_CREATED', {
        type: 'PRODUCT_CREATED',
        to: product.email,
        subject: 'New Product Added!',
        data: { product: product.name, vendor: product.vendorName },
        channel: ['EMAIL', 'APP'],
    }, { delay: 5000, priority: 2 })
  }

  async sendUserOrder(order: UserOrderNotificationData) {
  await this.eventQueue.sendNotification( 'ORDER_CREATED', {
      type: 'ORDER_CREATED',
      to: order.email,
      subject: `Hi ${order.name}, your order ${order.orderId} was placed successfully!`,
      data: {
        user: order.name,
        orderId: order.orderId,
        total: order.orderTotal,
        date: order.orderDate,
        vendor: order.vendorName,
        products: order.products.map(p => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price,
        })),
      },
      channel: ['EMAIL']
    },
    { delay: 5000, priority: 2 }
  )
  this.logger.log('order notification sent')
}


}
