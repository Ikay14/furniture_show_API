import { Vendor } from "../model/vendor.model";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { ApplyForVendorDto } from "../DTO/apply.vendor.dto";
import { CloudinaryService } from "src/services/cloudinary.service";
import { normalizeName } from "src/helpers/normalize.func";
import { UpdateApplyVendorDto } from "../DTO/updateapply.dto";


@Injectable()
export class ApplyVendorService {
    constructor(
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
        private cloudinaryService: CloudinaryService
    ){}

    async applyForVendor(applyDto: ApplyForVendorDto, [storeLogo, bannerLogo]: Express.Multer.File[]) {
        const { storeName  } = applyDto

        const isStoreNameTaken = await this.vendorModel.findOne({ storeName })
        if (isStoreNameTaken) throw new Error("Store name is already taken")
        
        const normalizedNameStoreName = normalizeName(storeName)
        

        const logoResult = await this.cloudinaryService.uploadFile(storeLogo, 'vendors/logos', 'image');
        const bannerResult = await this.cloudinaryService.uploadFile(bannerLogo, 'vendors/banners', 'image');


        const newVendor = new this.vendorModel({ 
            ...applyDto,
            storeLogo: logoResult.secure_url,
            bannerLogo: bannerResult.secure_url,
            storeName: normalizedNameStoreName, 
        })

        await newVendor.save()

        return {
            msg: 'Vendor application submitted',
            vendor: newVendor
        }
    }

    async updateAppllication(updateDTO: UpdateApplyVendorDto){

        const { vendorId } = updateDTO

        let getApplication = await this.vendorModel.findOneAndUpdate(
            { vendorId }, 
            { updateDTO, runValidator: true, new: true })

        if(!getApplication) { 
            throw new NotFoundException('No applicaton found for vendor')
        }

        const updatedApplication = getApplication 
        
        return {
            msg: 'update submitted successful',
            updatedApplication
        }
    }
 }