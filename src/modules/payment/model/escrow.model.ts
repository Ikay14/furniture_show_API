import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export enum EscrowStatus {
  HELD = 'held',
  RELEASE_QUEUED = 'release_queued',
  PAID_OUT = 'paid_out',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Escrow extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true })
  order: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true })
  vendor: Types.ObjectId;

  @Prop({ type: String, required: true })
  paymentReference: string;

  @Prop({ type: Number, required: true })
  grossAmount: number;

  @Prop({ type: Number, required: true, default: 10 })
  commissionRate: number;

  @Prop({ type: Number, required: true })
  platformFee: number;

  @Prop({ type: Number, required: true })
  netVendorAmount: number;

  @Prop({ type: String, default: 'NGN' })
  currency: string;

  @Prop({ type: String, enum: Object.values(EscrowStatus), default: EscrowStatus.HELD })
  status: EscrowStatus;

  @Prop({ type: String })
  transferCode?: string;

  @Prop({ type: String })
  transferReference?: string;

  @Prop({ type: Date })
  releasedAt?: Date;

  @Prop({ type: String })
  failureReason?: string;
}

export const EscrowSchema = SchemaFactory.createForClass(Escrow);
