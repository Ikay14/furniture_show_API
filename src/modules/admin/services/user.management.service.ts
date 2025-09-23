import { User } from "src/modules/user/model/user.model";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { CACHE_TTL } from "src/config/db.config";

type StatusEnum = 'verified' | 'unverified';

interface status {
    status: string,
    statusenum: StatusEnum
}

@Injectable()
export class UserManagementService {
    constructor(@InjectModel(User.name)
    private userModel: Model<User>,
    @InjectRedis() private redisCache: Redis,
){}

    async ListAllUsers(status: string, page: number, limit: number) {
        const query: any = {}

        const cacheKey = `users:list:${status}:${page}:${limit}`;

        const cachedUsers = await this.redisCache.get(cacheKey)
        if (cachedUsers) return JSON.parse(cachedUsers)

        // Filter by isVerified property
        if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'unverified') {
            query.isVerified = false;
        }

        const users = await this.userModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const response = users.map((user) => ({
            id: user._id,
            email: user.email,
            name: user.firstName + ' ' + user.lastName,
            isVerified: user.isVerified,
            dp: user.picture,
        }))

        await this.redisCache.set(cacheKey, JSON.stringify(response), 'EX', CACHE_TTL);

        return {
            msg: 'users returned',
            response,
            total: await this.userModel.countDocuments(query),
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