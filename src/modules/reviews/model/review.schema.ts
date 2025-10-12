import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

@Schema({ timestamps: true })
export class Review {
    
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  rating: number;

  @Prop()
  comment: string;

  @Prop({ default: false })
  isVerifiedPurchase: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review)