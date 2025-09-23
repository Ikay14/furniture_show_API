import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Roles, Vendor, VendorStatus } from "src/modules/vendor/model/vendor.model";
import { Admin } from "../model/admin.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { CACHE_TTL } from "src/config/db.config";
import { DeclineVendorDto } from "../DTO/decline.dto";
import { Logger } from "@nestjs/common";
import { NotificationService } from "src/modules/notification/notifcation.service"; 

@Injectable()
export class VendorManagementService {
    private readonly logger = new Logger(VendorManagementService.name);
    constructor(
        // @InjectModel(Admin.name) private adminModel: Model<Admin>, 
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
        @InjectRedis() private redisCache: Redis,
        private notificationService: NotificationService

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

    async approveVendorApplication(vendorId: string, adminUser : { id: string; email?: string }){

        if(!vendorId) throw new BadRequestException('vendor is required')

        const filter = { vendorId, status: VendorStatus.PENDING}   
        
        const update = {
            $set: {
                status: VendorStatus.APPROVED,
                isVerified: true,
                roles: Roles.VENDOR,
                approvedAt: new Date(),
                approvedBy: adminUser?.id || null
            }
        }

        const updatedApp = await this.vendorModel.findOneAndUpdate(filter, update, { new: true  })
        .lean()

        // call function to verify Documents like NIN

        if (!updatedApp) {
        const existing = await this.vendorModel.findOne({ vendorId }).lean();
        if (!existing) throw new NotFoundException(`Vendor application ${vendorId} not found`);
        throw new BadRequestException(`Cannot approve: application is ${existing.status}`);
    }
    
        await this.redisCache.del(`vendor:application:${vendorId}`);

        this.logger.warn(`Cache invalidation failed for vendor ${vendorId}`)

        await this.notificationService.sendVendorApproval({
            email: updatedApp.email,
            vendorName: updatedApp.storeName,
            status: updatedApp.status
        })
        
        const safeApp = { ...updatedApp }

        return {
            msg: 'application updated successfully',
            safeApp
        }
    }

    async getAllVendorApplications(
        page: number, limit: number , status: string
    ){
        const filter : any = {}

        if(status) filter.status = status

        const cacheKey = `vendor:applications:status:${status}:page:${page}:limit:${limit}`;

        const cachedStatus = await this.redisCache.get(cacheKey) 
        if(cachedStatus) return JSON.parse(cachedStatus)

        const applications = await this.vendorModel
        .find(filter)
        .skip((page - 1) * limit)  
        .limit(limit)

        if( status && !applications.length) throw new BadRequestException(`No vendor applications found for status: ${status}`)
            
        const formattedResponse = applications.map( application => ({ 
                id: application.vendorId,
                storeName: application.storeName,
                description: application.description,
                isVerified: application.isVerified,
                status: application.status,
                logo: application.storeLogo,
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

        if (!vendorId) throw new BadRequestException('Invalid vendorId')
    
        if (!reason?.trim()) throw new BadRequestException('Decline reason is required')

        const filter = { vendorId, status: VendorStatus.PENDING }
        
        const declineData = {
            $set: {
                reason,
                status: VendorStatus.DECLINED,
                declinedBy: adminId || null,
            }
        }

        const declineApp = await this.vendorModel.findOneAndUpdate(filter, declineData, { new: true } ).lean()   
        if (!declineApp) {
       
        const existing = await this.vendorModel.findOne({ vendorId }).lean();
        if (!existing) throw new NotFoundException(`Vendor application ${vendorId} not found`);
        throw new BadRequestException(`Cannot decline: application is ${existing.status}`);
        } 

        await this.redisCache.del(`vendor:application:${vendorId}`);

         this.logger.warn(`Vendor ${vendorId} declined by admin ${adminId}. Reason: ${reason}`)

        return {
                success: true,
                message: `Vendor ${vendorId} declined`,
                data: {
                vendorId: declineApp.vendorId,
                status: declineApp.status,
                reason: declineApp.reason,
                declinedBy: declineApp.declinedBy,
        },
    };

    }

}