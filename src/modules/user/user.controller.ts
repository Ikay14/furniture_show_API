import { Controller, Post, Patch, Get, Body, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/decorators/user.decorator';
import { UpdateUserProfile } from './DTO/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
    @UseInterceptors(FileInterceptor('file'))
    async updateUserProfile(
        @Body() dto: UpdateUserProfile,
        @UploadedFile() file: Express.Multer.File
    ){
        return this.userService.updateUserProfile(dto, file)
    }

    @Patch('delete-user')
    async deleteUser(
        @GetUser('id') userId: string){
            return await this.userService.deleteUser(userId)
        }
}
