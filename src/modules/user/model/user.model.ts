import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import shortUUID from "short-uuid";


export interface IUser {
  _id: shortUUID.UUID;
  username: string;
  email: string;
  password: string;
 role?: string; // Optional field for user role
}
@Schema({ timestamps: true })
export class  User extends Document { 
  
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
  
  @Prop({})
  wishList?: string[];

  @Prop({})
  otp: string;

  @Prop({})
  otpExpires: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);