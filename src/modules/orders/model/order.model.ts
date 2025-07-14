import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import shortUUID from "short-uuid";

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
        _ids = String;

    @Prop({ ref: 'User', type: Types.ObjectId })
    userId: Types.ObjectId
 
    @Prop({ type: [{ productId: { type: Types.ObjectId, ref: 'Product' }, quantity: { type: Number, default: 1 } }] })
    products: { productId: Types.ObjectId; quantity: number }[]

    @Prop({ type: Number, default: 0 })
    totalPrice: number;               

    @Prop({ type: Boolean, default: false })
    isPaid: boolean;

    @Prop({ type: Boolean, default: false })
    isDelivered: boolean;

    @Prop({ type: Date })
    deliveredAt: Date;

    @Prop({ type: Date })
    paidAt: Date;

    @Prop({ type: String, default: 'pending' })
    status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);