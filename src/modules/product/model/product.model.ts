import { SchemaFactory, Prop, Schema } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import shortUUID from "short-uuid";

@Schema({ timestamps: true })
export class Product extends Document {

      @Prop({ 
            type: String,
             default: () => shortUUID.generate(), 
             unique: true, 
             index: true, 
             required: true 
            })
        _ids = String;

    @Prop({ 
        type: String,
        index: true
     })
  name: String;

  @Prop({ required: true })
  description: string;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: string;

  @Prop({ required: true })  
  price: number;

  @Prop()
  discountPrice?: number;

  @Prop({ required: true, default: 0 })
  inStock: number;

  @Prop()
  sku?: string;

  @Prop({ required: true })
  images: string[]; 

  @Prop()
  mainImage?: string;

  @Prop()
  thumbnail?: string;

    @Prop({
    type: {
      width: Number,
      height: Number,
      depth: Number,
    },
     })
     dimensions?: {
    width: number;
    height: number;
    depth: number;
    };

    @Prop()
    weight?: string;

    @Prop()
    material?: string;

    @Prop({ type: [String] })
    colorOptions?: string[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true })
    reviews: Types.ObjectId;

    @Prop({ type: [String] })
    tags?: string[];

    @Prop({ default: 0 })
    numReviews: number;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: 'active' })
    status: 'active' | 'inactive' | 'draft';

    @Prop({ type: String, ref: 'Vendor', required: true })
    vendor: string; // Vendor UUID

}

export const ProductSchema = SchemaFactory.createForClass(Product);
