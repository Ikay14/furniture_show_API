import { Controller, Get, Delete, Query, Param } from "@nestjs/common";
import { UserManagementService } from "../services/user.management.service";


@Controller('admin-user-mgt')
export class UserManagementController {
    constructor(private userMgtService: UserManagementService){}

    @Get('all')
    async getAllUsers(
        @Query('status') status: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ){
        return this.userMgtService.ListAllUsers(status, page, limit)
    }

    @Get('/:userId')
    async getUser(
        @Param('userId') userId: string
    ){
        return this.userMgtService.getUser(userId)
    }

    @Delete(':userId/delete-user')
    async deleteUser(
        @Param('userId') userId: string
    ){
        return this.userMgtService.deleteAUser(userId) 
    }
}   