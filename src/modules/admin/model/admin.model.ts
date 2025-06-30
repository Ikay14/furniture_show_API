import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import shortUUID from "short-uuid";

@Schema({ timestamps: true })
export class Admin extends Document {

    @Prop({ 
            type: String,
             default: () => shortUUID.generate(), 
             unique: true, 
             index: true, 
             required: true 
            })
        _ids = String;

    @Prop({
        required: true, 
        unique: true })
        email: string;

    @Prop({
        required: true })
        password: string;

    @Prop({ 
        default: false })
        isSuperAdmin: boolean;

    @Prop({ default: false })
    isActive: boolean;
    
    @Prop({ default: false })
    isDeleted: boolean;

}

export const AdminSchema = SchemaFactory.createForClass(Admin);
