import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";


// export enum NotificationType {
//     VENDOR_APPROVED = 'VENDOR_APPROVED',
//     NEW_PRODUCT_ADDED = 'NEW_PRODUCT_ADDED',
//     SYSTEM_ALERT = 'SYSTEM_ALERT',
//     OTHER = 'OTHER'
// } 

@Schema({ timestamps: true })
export class Notification{
    @Prop({ required: true })
    recipient: string // who receives this notification (user, vendor, admin )

    @Prop() // ({ required: true, enum: NotificationType })
    type: string[]

    @Prop({ required: true })
    message: string

    @Prop({ default: false })
    read: boolean
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)

