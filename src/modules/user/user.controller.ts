import { Controller, Post, Patch, Get, Body, UseInterceptors, UploadedFile, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/decorators/user.decorator';
import { UpdateUserProfile } from './DTO/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt.guard';


@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Get()
    async getUserprofile(
        @GetUser('id') userId: string
    ){
        return await this.userService.getUser(userId)
    }

    @Patch('update-profile')
    async updateUserProfile(
        @GetUser('id') userId: string,
        @Body() dto: UpdateUserProfile
    ){
        return this.userService.updateUserProfile(userId, dto)
    }

    @Patch('upload-ava')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @GetUser('id') userId: string,
        @UploadedFile() file: Express.Multer.File
    ){
        return this.userService.uploadAvatar(userId, file)
    }

    @Patch('delete-user')
    async deleteUser(
        @GetUser('id') userId: string){
            return await this.userService.deleteUser(userId)
        }
}
