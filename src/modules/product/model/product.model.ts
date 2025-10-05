import { SchemaFactory, Prop, Schema } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Product extends Document {

  @Prop({ 
        type: String,
        default: uuidv4, 
        unique: true, 
        required: true 
         })
  productId = String;

  @Prop({ 
        type: String,
        index: true
     })
  name: string;

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

  // @Prop()
  // mainImage?: string;

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

    @Prop({ required: true})
    colorOptions: string[]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Review' })
    reviews: Types.ObjectId;

    @Prop({ type: [String] })
    tags: string[];

    @Prop({ default: 0 })
    numReviews: number;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: 'active' })
    status: 'active' | 'inactive' | 'draft';

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true })
    vendor: Types.ObjectId; 

}

export const ProductSchema = SchemaFactory.createForClass(Product);
