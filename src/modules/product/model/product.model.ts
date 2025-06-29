import { SchemaFactory, Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
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
        _id = String;

    @Prop({ 
        type: String,
        index: true
     })
    name: String;

    @Prop({ required: true })
  description: string;

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

     @Prop()
    brand?: string;

    @Prop({ type: [String] })
    tags?: string[];

    @Prop({ default: 0 })
    rating: number;

    @Prop({ default: 0 })
    numReviews: number;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ default: 'active' })
    status: 'active' | 'inactive' | 'draft';

    @Prop()
    createdBy?: string; // Admin user ID
}

export const ProductSchema = SchemaFactory.createForClass(Product);
