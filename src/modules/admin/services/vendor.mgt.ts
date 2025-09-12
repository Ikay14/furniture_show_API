import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Vendor } from "src/modules/vendor/model/vendor.model";
import { Admin } from "../model/admin.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class VendorManagementService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<Admin>, 
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor> 
    ){}

    async getVendorApplication(vendorId: string){
        const application = await this.vendorModel.findOne({ vendorId })
        if(!application) throw new NotFoundException(`vendor application with ${vendorId} not found`)

        return {
            msg: 'application found',
            application
        }    
    }

    async approveVendorApplication(vendorId: string, adminId:string){

        const isAdmin = await this.adminModel.findOne({ adminId })
        if (!isAdmin) throw new UnauthorizedException(`user with id ${adminId} cant perform this task `)

         const application = await this.vendorModel.findOne({ vendorId })
        if(!application) throw new NotFoundException(`vendor application with ${vendorId} not found`)

        // call function to verify Documents like NIN

        application.isVerified = true
        await application.save()

        return {
            msg: 'application updated successfully',
            application
        }
    }

    async getAllVendorApplications(
        param: { page: number; limit: number }, status: string
    ){
        const { page, limit } = param


        const vendorApplications = await this.vendorModel
        .find({ status })
        .skip((page - 1) * limit)
        .limit(limit);

        if( status && !vendorApplications.length) throw new BadRequestException('No vendor application found for query');
                
        if (!vendorApplications.length && vendorApplications.length === 0) throw new BadRequestException('No Application Found');

         return {
                msg: 'Application fetched successfully',
                pagination: {
                    page,
                    limit,
                    total: await this.vendorModel.countDocuments({ status }),
                },
                vendorApplications
            }
    }

    async declineVendorApplication(){

    }
}