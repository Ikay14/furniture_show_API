import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './model/user.model';
import { Model } from 'mongoose';
import { UpdateUserProfile } from './DTO/update-user.dto';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { toUserEntity, UserEntity } from './DTO/user-entity.dto';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)
    constructor(
        private cloudinaryService: CloudinaryService,
        @InjectModel(User.name) private readonly userModel: Model<User>
    ){}

    async getUser(userId: string):Promise<{user: UserEntity}>{
        const user = await this.userModel.findById( userId ).lean()
        if(!user) throw new NotFoundException(`${userId} not found`)

        return {user: toUserEntity(user) }   
    }
        
    

    async updateUserProfile(userId: string, updateDto: UpdateUserProfile):Promise<{msg: string, user: UserEntity }>{

        const user = await this.userModel.findByIdAndUpdate(
             userId,
            { $set: updateDto },
            { runValidators: true, new: true }
        )

        if(!user) throw new NotFoundException(`${userId} not a user`)

        return {
            msg: 'user update successfully',
            user: toUserEntity(user)
        }    
    }

    async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ user: UserEntity}>{

        const user = await this.userModel.findById(userId)
        if(!user) throw new NotFoundException(`${userId} not found`)

        const uploadAvatar = await this.cloudinaryService.uploadFile(file, 'user', 'image' )
        if (!uploadAvatar) this.logger.log(`upload failed, retry`)

        user.avatar = uploadAvatar.secure_url;

        await user.save()    

        return { user: toUserEntity(user) }
    }

    async deleteUser(userId:string){
        await this.userModel.findOneAndUpdate(
            { userId  },
            { isDeleted: true }
        );

        return { msg: 'user deleted' }
    }
}
