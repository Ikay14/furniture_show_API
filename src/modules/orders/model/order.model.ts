import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import shortUUID from "short-uuid";
import { Product } from "src/modules/product/model/product.model";
import { Vendor } from "src/modules/vendor/model/vendor.model";

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Order extends Document {

    @Prop({ 
        type: String,
        default: () => shortUUID.generate(), 
        unique: true, 
        index: true, 
        required: true 
      })
    orderId: string;

    @Prop({ ref: 'User', type: Types.ObjectId })
    user: Types.ObjectId;

  @Prop([{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    quantity: { type: Number, required: true, default: 1 }
  }])
  items: {
    product: Product;
    vendor: Vendor;
    quantity: number;
  }[]

    @Prop({ type: Number, default: 0 })
    totalPrice: number;               

    @Prop({ type: Boolean, default: false })
    isPaid: boolean;

    @Prop({ type: String, default: 'card' })
    paymentMethod: string;

    @Prop({ type: Boolean, default: false })
    isDelivered: boolean;

    @Prop({ type: Date })
    deliveredAt: Date;

    @Prop({ type: Date })
    paidAt: Date;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String, default: 'pending' })
    status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);