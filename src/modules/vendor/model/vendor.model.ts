import mongoose, { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { v4 as uuidv4 } from 'uuid';
import { User } from "src/modules/user/model/user.model";



@Schema({ timestamps: true })
export class Vendor {
        @Prop({ 
        type: String,
        default: uuidv4, 
        unique: true, 
        index: true, 
        required: true 
         })
        vendorId = String;

        @Prop({required: true, unique: true}) 
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
       
        @Prop({ type: String, enum: ['vendor', 'user'], default: 'user' })
        roles: string;

        @Prop({})
        otp: string;
    
        @Prop({})
        otpExpires: Date;    

        @Prop({}) 
        isVerified: boolean

        isActive: boolean

        @Prop({}) 
        isSuspended: boolean
 
        @Prop({}) 
        lastLogin: Date
}


export const VendorSchema = SchemaFactory.createForClass(Vendor);