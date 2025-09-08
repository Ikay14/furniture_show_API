import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';


export type UserDocument = User & Document & {
  sanitize(): Partial<User>;
};

@Schema({ timestamps: true, _id: false })
export class User extends Document {
  
   @Prop({
        type: String,
        default: uuidv4,
        required: true,
        unique: true
      })
     userId: string;
     
    @Prop({ 
      type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    })
    email: string;

    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    picture?: string;

    @Prop({
      type: String,
        minlength: 6,
        select: false, // Exclude password from queries by default
    })
    password?: string;

  @Prop({
      type: String,
      enum: ["user", "admin"], 
      default: "user", 
    
  })
  role: string;
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }] })
  carts: Types.ObjectId[]

  @Prop()
  wishList: string[]

  @Prop({ default: false })
  isVerified?: boolean

  @Prop({ default: false })
  isDeleted?: boolean

  @Prop({})
  otp: string;

  @Prop({})
  otpExpires: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.sanitize = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
  
};
