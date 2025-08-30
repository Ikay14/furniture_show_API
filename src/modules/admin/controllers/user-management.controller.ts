import { Controller, Get, Delete, Query, Param } from "@nestjs/common";
import { UserManagementService } from "../services/user.management.service";
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admin User Management')
@Controller('admin-user-mgt')
export class UserManagementController {
    constructor(private userMgtService: UserManagementService){}

    @Get('all')
    @ApiOperation({ summary: 'Get all users with optional status filter and pagination' })
    @ApiQuery({ name: 'status', required: false, type: String, example: 'verified', description: 'User verification status' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of users per page' })
    @ApiResponse({ status: 200, description: 'Users fetched successfully' })
    async getAllUsers(
        @Query('status') status: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ){
        return this.userMgtService.ListAllUsers(status, page, limit)
    }

    @Get('/:userId')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiParam({ name: 'userId', type: String, description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User returned successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUser(
        @Param('userId') userId: string
    ){
        return this.userMgtService.getUser(userId)
    }

    @Delete(':userId/delete-user')
    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiParam({ name: 'userId', type: String, description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    async deleteUser(
        @Param('userId') userId: string
    ){
        return this.userMgtService.deleteAUser(userId) 
    }
}