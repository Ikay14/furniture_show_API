import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";


export const PaymentStatus = {
  INITIATED: "initiated",
  PENDING: "pending",
  SUCCESSFUL: "successful",
  FAILED: "failed",
};


export type paymentDocument = Payment & Document & {
  sanitize(): Partial<Payment>;
};

@Schema({ timestamps: true })
export class Payment extends Document {
    @Prop({ type: String, required: true })
    txRef: string;

    @Prop({ type: String, required: true })
    reference: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: String, required: true })
    orderId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    customerId: Types.ObjectId;

    @Prop({ type: Date })
    paymentDate: Date
   

    @Prop({ type: String, enum: Object.values(PaymentStatus), required: true })
    status: string;

    @Prop({ type: String, enum: ['card', 'bank', 'ussd', 'qr', 'mobile_money'], default: 'card' })
    paymentMethod: string;

    @Prop({ type: Object })
    paymentDetails: Record<string, any>


    @Prop({ type: String, default: 'USD' })
    currency: string;

    @Prop({ type: Object })
    gatewayResponse?: any;

    @Prop({ type: String })
    errorMessage?: string;

    @Prop({ type: Boolean, default: false })
    isRefunded: boolean;

    @Prop({ type: String })
    refundReference?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.methods.sanitize = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
  
};
