import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Matches } from "class-validator";
import mongoose, { Document, Types } from "mongoose";
import { Vendor } from "src/modules/vendor/model/vendor.model";
import { v4 as uuidv4 } from 'uuid';


export type UserDocument = User & Document & {
  sanitize(): Partial<User>;
};

@Schema({ timestamps: true })
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
    phone: number

  @Prop()
    address: string

  @Prop({
      type: String,
      enum: ["male",'female'], 
    })
  gender: string
  
  @Prop({ type: String })
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, { message: 'DOB must be in YYYY/MM/DD format' })
  dob: string;


  @Prop()
  avatar?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' })
    vendor?: Vendor

  @Prop({
      type: String,
        minlength: 6,
    })
    password?: string;

  @Prop({
      type: String,
      enum: ["user",'vendor', "admin"], 
      default: "user", 
    
  })
  roles: string[]
  
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
