import { Controller, UseInterceptors, Post, UploadedFiles, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApplyForVendorDto } from '../DTO/apply.vendor.dto';
import { UpdateApplyVendorDto } from '../DTO/updateapply.dto';
import { memoryStorage } from 'multer';
import { ApplyForVendorService } from '../services/apply.vendor.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('Vendor')
@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class ApplyForVendorController {
    constructor(private applyForVendor: ApplyForVendorService){}

    @Post('apply')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'storeLogo', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 }
    ], {
        storage: memoryStorage()
    }))
    @ApiBody({ type: ApplyForVendorDto })
    @ApiResponse({ status: 201, description: 'Application submitted successfully' })
    async applyVendor(
        @Body() applyDto: ApplyForVendorDto,
        @UploadedFiles() 
       files: {
         storeLogo: Express.Multer.File[],
         bannerImage: Express.Multer.File[]
        },
        
    ){
        return this.applyForVendor.applyForVendor(applyDto, 
            files.storeLogo?.[0], 
            files.bannerImage?.[0]
        )
    }

    @Post('update-application')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'storeLogo', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 }
    ], {
        storage: memoryStorage()
    }))
    @ApiBody({ type: UpdateApplyVendorDto })
    @ApiResponse({ status: 200, description: 'Application updated successfully' })
    async updateApplication(
        @Body() updateDTO: UpdateApplyVendorDto,
        @UploadedFiles() 
       files: {
         storeLogo: Express.Multer.File[],
         bannerImage: Express.Multer.File[]
        },
    ){
        return this.applyForVendor.updateAppllication(updateDTO,
            files.storeLogo?.[0],
            files.bannerImage?.[0] )
    }
}
