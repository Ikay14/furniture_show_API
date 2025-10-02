import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './model/user.model';
import { Model } from 'mongoose';
import { UpdateUserProfile } from './DTO/update-user.dto';
import { CloudinaryService } from 'src/services/cloudinary.service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)
    constructor(
        private cloudinaryService: CloudinaryService,
        @InjectModel(User.name) private readonly userModel: Model<User>
    ){}

    async getUser(userId: string){
        return await this.userModel.findOne({ userId })
    }

    async updateUserProfile(updateDto: UpdateUserProfile, file: Express.Multer.File){
        const { userId } = updateDto

        const uploadAvatar = await this.cloudinaryService.uploadFile(file, 'user', 'image' )
        if (!uploadAvatar) this.logger.log(`upload failed, retry`)

        const user = await this.userModel.findOneAndUpdate(
            { userId },
            { $set: updateDto, picture: uploadAvatar },
            { runValidators: true, new: true }
        )

        if(!user) throw new NotFoundException(`${userId} not a user`)

        return {
            msg: 'user update successfully',
            user
        }    
    }

    async deleteUser(userId:string){
        await this.userModel.findOneAndUpdate(
            { userId  },
            { isDeleted: true }
        );

        return { msg: 'user deleted' }
    }
}
