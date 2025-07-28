import { User } from "src/modules/user/model/user.model";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

type StatusEnum = 'verified' | 'unverified';

interface status {
    status: string,
    statusenum: StatusEnum
}

@Injectable()
export class UserManagementService {
    constructor(@InjectModel(User.name)
    private userModel: Model<User>
){}

    async ListAllUsers(status: string, page: number, limit: number): Promise<{ msg: string, users: User[], total: number, limit: number, page: number }> {
        const query: any = {};

        // Filter by isVerified property
        if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'unverified') {
            query.isVerified = false;
        }

        const users = await this.userModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await this.userModel.countDocuments(query)

        return {
            msg: 'users returned',
            users,
            total,
            limit,
            page
        }
    }

    async getUser(userId: string):Promise<{ msg: string, user: User }>{
        const user = await this.userModel.findOne({ _id: userId})

        if(!user) throw new NotFoundException('Not a user')

         return {
            msg: `User with id ${userId} returned succcessfully`,
            user
         }   
    }

    async deleteAUser(userId: string):Promise<{ msg: string }>{
        const del = await this.userModel.findOneAndUpdate(
            { userId, isDeleted: true}, 
            { new: true })

            if(!del) throw new BadRequestException('user not deleted')

            return {
                msg: `user with id ${userId} deleted successfully`
            }    
    }

}