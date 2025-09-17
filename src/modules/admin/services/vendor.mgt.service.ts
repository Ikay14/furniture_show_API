import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Vendor } from "src/modules/vendor/model/vendor.model";
import { Admin } from "../model/admin.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { CACHE_TTL } from "src/config/db.config";
import { DeclineVendorDto } from "../DTO/decline.dto";

@Injectable()
export class VendorManagementService {
    constructor(
        // @InjectModel(Admin.name) private adminModel: Model<Admin>, 
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
        @InjectRedis() private redisCache: Redis

    ){}

    async getVendorApplication(vendorId: string){

        const cacheKey = `vendor:application:${vendorId}`;

        const cachedVendorApp = await this.redisCache.get(cacheKey)
        if(cachedVendorApp) return JSON.parse(cachedVendorApp)

        const application = await this.vendorModel.findOne({ vendorId })
        if(!application) throw new NotFoundException(`vendor application with ${vendorId} not found`)

        const appData = {
                vendorId: application.vendorId,
                name: application.storeName,
                status: application.description,
                isVerified: application.isVerified,
        };    

        await this.redisCache.set(cacheKey,
        JSON.stringify(appData), 'EX', CACHE_TTL)

        return {
            msg: 'application found',
            appData
        }    
    }

    async approveVendorApplication(vendorId: string){

         const application = await this.vendorModel.findOne({ vendorId })
        if(!application) throw new NotFoundException(`vendor application with ${vendorId} not found`)

        // call function to verify Documents like NIN

        application.isVerified = true

        await application.save();
        // Invalidate cache
        await this.redisCache.del(`vendor:application:${vendorId}`);
        await this.redisCache.del(`vendor:applications:status:${application.isVerified}*`); // pattern delete


        return {
            msg: 'application updated successfully',
            application
        }
    }

    async getAllVendorApplications(
        page: number, limit: number , status: string
    ){


        const cacheKey = `vendor:applications:status:${status}:page:${page}:limit:${limit}`;

        const cachedStatus = await this.redisCache.get(cacheKey) 
        if(cachedStatus) return JSON.parse(cachedStatus)

        const applications = await this.vendorModel
        .find({ status })
        .skip((page - 1) * limit)  
        .limit(limit)

        if( status && !applications.length) throw new BadRequestException(`No vendor applications found for status: ${status}`)

        const formattedResponse = applications.map( application => ({ 
                id: application.vendorId,
                storeName: application.storeName,
                description: application.description,
                isVerified: application.isVerified,
            }))


        await this.redisCache.set(cacheKey, JSON.stringify(formattedResponse), 'EX', CACHE_TTL);

       return {
                msg: 'Application fetched successfully', 
                pagination: {
                    page,
                    limit,
                    total: await this.vendorModel.countDocuments({ status }),
                },
                formattedResponse
            }
         
    }

    async declineVendorApplication(vendorId: string, declineDto: DeclineVendorDto) {
        const { reason, adminId } = declineDto;

        if (!vendorId) {
        throw new BadRequestException('Invalid vendorId');
    }
        if (!reason?.trim()) {
        throw new BadRequestException('Decline reason is required');
    }

        const updatedApp = await this.vendorModel.findOneAndUpdate(
            { vendorId },
            {
                reason,
                isVerified: false,
                declinedAt: new Date(),
                declinedBy: adminId,
            },
                { new: true }
        );

        if (!updatedApp) {
            throw new NotFoundException(`Vendor application ${vendorId} not found`);
        }

        await this.redisCache.del(`vendor:${vendorId}`);

        return {
            success: true,
            message: `Vendor application ${vendorId} declined`,
            data: updatedApp,
        };
}

}