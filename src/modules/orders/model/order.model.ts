import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { Product } from "src/modules/product/model/product.model";
import { User } from "src/modules/user/model/user.model";
import { Vendor } from "src/modules/vendor/model/vendor.model";

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProductionStage {
  DESIGN_CONFIRMED = 'design_confirmed',
  IN_CARPENTRY = 'in_carpentry',
  UPHOLSTERY_FINISHING = 'upholstery_finishing',
  QUALITY_CHECK = 'quality_check',
  OUT_FOR_DELIVERY = 'out_for_delivery',
}

export interface ProductionMilestone {
  stage: ProductionStage;
  notes?: string;
  photoUrls?: string[];
  completedAt: Date;
  updatedBy?: string;
}

export interface Items {
    product: Types.ObjectId | Product
    quantity: number
    _id?: Types.ObjectId
}


@Schema({ timestamps: true })
export class Order extends Document {

    @Prop({ 
        type: String,
        default: uuidv4, 
        unique: true, 
        index: true, 
        required: true 
      })
    orderId: string;

    @Prop({  type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: User

    @Prop({ vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }})
    vendor: Vendor

   @Prop([{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 }
  }])
    items: Items[]

    @Prop({ type: Number, default: 0 })
    totalPrice: number;               

    @Prop({ type: Boolean, default: false })
    isPaid: boolean;

    // @Prop({ type: String, default: 'card' })
    // paymentMethod: string;

    @Prop({ type: Boolean, default: false })
    isDelivered: boolean;

    @Prop({ type: Date })
    deliveredAt: Date;

    @Prop({ type: Date })
    paidAt: Date;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String, default: 'pending' })
    status: OrderStatus

    @Prop({ type: Object })
    customSpecs?: Record<string, any>;

    @Prop({ type: Date })
    estimatedCompletionDate?: Date;

    @Prop({
      type: [
        {
          stage: { type: String, enum: Object.values(ProductionStage), required: true },
          notes: { type: String },
          photoUrls: { type: [String], default: [] },
          completedAt: { type: Date, default: Date.now },
          updatedBy: { type: String },
        },
      ],
      default: [],
    })
    milestones?: ProductionMilestone[];

    @Prop({ type: Date })
    createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);