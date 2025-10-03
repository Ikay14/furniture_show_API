import { Type } from "@nestjs/common";
import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument, Types } from "mongoose";
import { Product } from "src/modules/product/model/product.model";
import { Vendor } from "src/modules/vendor/model/vendor.model";
import { v4 as uuidv4 } from 'uuid';

export interface CartItemRaw {
    product: Types.ObjectId | Product
    vendor: Types.ObjectId | Vendor
    quantity: number
    _id?: Types.ObjectId
}

// // Interface for cart item when POPULATED
// export interface CartItemPopulated {
//   product: Product; // Full Product document
//   vendor: Vendor;   // Full Vendor document
//   quantity: number;
//   _id?: Types.ObjectId;
// }

@Schema({ timestamps: true, _id: false })
export class Cart extends Document
 {

  @Prop({
      type: String,
      default: uuidv4,
      required: true,
    })
   cartId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop([{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    quantity: { type: Number, required: true, default: 1 }
  }])
  items: CartItemRaw[]

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


export type CartDocument = HydratedDocument<Cart>;
// export type CartPopulatedDocument = Omit<CartDocument, 'items'> & {
//   items: CartItemPopulated[];
// };