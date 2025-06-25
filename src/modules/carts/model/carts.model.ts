import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ ref: 'User', type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ type: [{ productId: { type: Types.ObjectId, ref: 'Product' }, quantity: { type: Number, default: 1 } }] })
  products: { productId: Types.ObjectId; quantity: number }[];

 @Prop({ type: Number, default: 0 })
 totalPrice: number;

  @Prop({ type: Boolean, default: false })
  isPurchased: boolean;

 @Prop({ type: Date, default: null })
  purchasedAt: Date | null; 

  @Prop({ type: Boolean, default: false })
  isActive: boolean;

    @Prop({ type: Boolean, default: false })
  isDeleted: boolean;


}

export const CartSchema = SchemaFactory.createForClass(Cart);