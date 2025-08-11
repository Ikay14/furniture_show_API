import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import shortUUID from "short-uuid";
import { v4 as uuidv4 } from 'uuid';

export enum Roles {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export type AdminDocument = Admin & Document & {
  sanitize(): Partial<Admin>;
};

@Schema({ timestamps: true })
export class Admin extends Document {

    @Prop({ 
            type: String,
             default: () => shortUUID.generate(), 
             unique: true, 
             index: true, 
             required: true 
            })
        _id = String;

    @Prop({
        required: true, 
        unique: true })
        email: string;

    @Prop({
        required: true })
        password: string;

    @Prop({
            type: [String],
            enum: Object.values(Roles),
            default: [Roles.ADMIN]
        })
    roles: string[];
    
      @Prop({})
      otp: string;
    
      @Prop({})
      otpExpires: Date;    

    @Prop({ 
        default: false })
        isSuperAdmin: boolean;

    @Prop({ default: false })
    isActive: boolean;
    
    @Prop({ default: false })
    isDeleted: boolean;

}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.methods.sanitize = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
  
};
