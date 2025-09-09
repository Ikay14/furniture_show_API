import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from "mongoose";

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: String })
  adminId: string

  @Prop({ default: false })
  isdeleted: boolean;

  @Prop()
  imageUrl: string; 
}

export const CategorySchema = SchemaFactory.createForClass(Category);
