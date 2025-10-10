// src/user/user.controller.ts
import { Controller, Post, Patch, Get, Body, UseInterceptors, UploadedFile, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { GetUser } from 'src/decorators/user.decorator';
import { UpdateUserProfile } from './DTO/update-user.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';


class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}

@ApiTags('users') 
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getUserprofile(
    @GetUser('id') userId: string
  ) {
    return await this.userService.getUser(userId);
  }

  @Patch('update-profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateUserProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateUserProfile
  ) {
    return this.userService.updateUserProfile(userId, dto);
  }

  @Patch('upload-ava')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data') 
  @ApiBody({ type: FileUploadDto }) 
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.userService.uploadAvatar(userId, file);
  }

  @Patch('delete-user')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteUser(
    @GetUser('id') userId: string
  ) {
    return await this.userService.deleteUser(userId);
  }
}
