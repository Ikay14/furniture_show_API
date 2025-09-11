import { Vendor } from "../model/vendor.model";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { ApplyForVendorDto } from "../DTO/apply.vendor.dto";
import { CloudinaryService } from "src/services/cloudinary.service";
import { normalizeName } from "src/helpers/normalize.func";
import { UpdateApplyVendorDto } from "../DTO/updateapply.dto";
import { User } from "src/modules/user/model/user.model";


@Injectable()
export class ApplyForVendorService {
    constructor(
        @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
        @InjectModel(User.name) private userModel: Model<User>,
        private cloudinaryService: CloudinaryService
    ){}

    async applyForVendor(applyDto: ApplyForVendorDto, [storeLogo, bannerLogo]: [Express.Multer.File?, Express.Multer.File?]) {
        const { storeName, userId  } = applyDto

        const isUserVerified = await this.userModel.findOne({ userId, isVerified: true })
        if(!isUserVerified) throw new Error("User not verified or does not exist")

        const isStoreNameTaken = await this.vendorModel.findOne({ storeName })
        if (isStoreNameTaken) throw new Error("Store name is already taken")
        
        const normalizedNameStoreName = normalizeName(storeName)
        

        const logoResult = await this.cloudinaryService.uploadFile(storeLogo?.[0], 'vendors/logos', 'image');
        const bannerResult = await this.cloudinaryService.uploadFile(bannerLogo?.[0], 'vendors/banners', 'image');


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

    async updateAppllication(updateDTO: UpdateApplyVendorDto, [ storeLogo, bannerLogo ]: 
        [Express.Multer.File?, Express.Multer.File?
        ]) {

        const { vendorId } = updateDTO

        let getApplication = await this.vendorModel.findOne({ vendorId })

        if(!getApplication) { 
            throw new NotFoundException('No applicaton found for vendor')
        }

        if(storeLogo || bannerLogo){
            const [ updatedStoreLogo, updatedBannerLogo ] = await Promise.all([
                storeLogo ? this.cloudinaryService.uploadFile(storeLogo, 'vendors/logos', 'image') : null,
                bannerLogo ? this.cloudinaryService.uploadFile(bannerLogo, 'vendors/banners', 'image') : null
            ])

        if(updatedStoreLogo) updateDTO.storeLogo = updatedStoreLogo.secure_url
        if(updatedBannerLogo) updateDTO.bannerLogo = updatedBannerLogo.secure_url

        }    

        await getApplication.updateOne(
            { ...updateDTO },
            { updateDTO, runValidator: true, new: true }
        )

        return {
            msg: 'update submitted successful',
            getApplication
        }
    }
 }