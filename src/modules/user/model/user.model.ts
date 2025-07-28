import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import shortUUID from "short-uuid";
import { Cart } from "src/modules/carts/model/carts.model";


export type UserDocument = User & Document & {
  sanitize(): Partial<User>;
};

@Schema({ timestamps: true })
export class User extends Document {
  
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
      required: true,           
        unique: true,
        index: true,
        trim: true,
        minlength: 3,  
        maxlength: 30,
    })
    username: string;

    @Prop({ 
      type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    })
    email: string;

    @Prop({
      type: String,
        required: true,
        minlength: 6,
        select: false, // Exclude password from queries by default
    })
    password: string;

  @Prop({
      type: String,
      enum: ["user", "admin"], // Define roles if needed
      default: "user", // Default role is user
    
  })
  role: string;
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }] })
  carts: (Types.ObjectId | Cart)[]

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
