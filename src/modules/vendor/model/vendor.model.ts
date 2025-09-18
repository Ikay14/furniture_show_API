import mongoose, { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { v4 as uuidv4 } from 'uuid';
import { User } from "src/modules/user/model/user.model";
import { Admin } from "src/modules/admin/model/admin.model";


export const VendorStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
} as const;

export const Roles = {
  USER: 'user',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;


@Schema({ timestamps: true })
export class Vendor {
        @Prop({ 
        type: String,
        default: uuidv4, 
        unique: true, 
        required: true 
         })
        vendorId = String;

        @Prop({ required: true, unique: true }) 
        storeName: string
        
        @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
        owner: User; 

        @Prop({}) 
        email: String

        @Prop({}) 
        phone: number

        @Prop({}) 
        businessType: string

        @Prop({}) 
        businessRegistrationNumber: string

        @Prop({}) 
        NIN: string

        @Prop({}) 
        address: string

        @Prop({}) 
        country: string

        @Prop({}) 
        state: string

        @Prop({}) 
        city: string

        @Prop({}) 
        bankAccountNumber: string

        @Prop({})
        bankName: string

        @Prop({}) 
        payoutRecipientCode: string

        @Prop({}) 
        currency: string

        @Prop({}) 
        commissionRate: number

        @Prop({}) 
        storeLogo: string

        @Prop({}) 
        bannerImage: string

        @Prop({}) 
        description: string

        @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }) 
        categories: Types.ObjectId[]

        @Prop({ type: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: { type: Number, default: 1 } }] }) 
        products: { product: Types.ObjectId; quantity: number }[]

        @Prop({}) 
        rating: number

        @Prop({}) 
        reviewCount: number

        @Prop({}) 
        orderFulfillmentRate: number

        @Prop({}) 
        cancellationRate: number

        @Prop({}) 
        returnRate: number

        @Prop({})
        password: string

        @Prop()
        reason: string

        @Prop({})
        approvedAt: Date

        @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true })
        approvedBy: Admin

        @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true })
        declinedBy: Admin
       
        @Prop({
            type: [String],
            enum: Object.values(Roles),
            default: [Roles.USER]
        })
        roles: string[];

        @Prop({ default: false}) 
        isVerified: boolean

        @Prop({
                type: [String],
                enum: Object.values(VendorStatus),
                default: [VendorStatus.PENDING]
                })
        status: string[];

        @Prop({ default: true }) 
        isActive: boolean

        @Prop({ default: false }) 
        isSuspended: boolean
 
        @Prop({}) 
        lastLogin: Date
}


export const VendorSchema = SchemaFactory.createForClass(Vendor);