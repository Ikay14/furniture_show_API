import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CreateAdminDto } from '../DTO/create-admin.dto';
import { LoginDTO } from '../DTO/login.admin-dto';
import { Response } from 'express';
import { AdminService } from '../services/admin.auth-service';
import { ValidateDTO } from 'src/modules/user/DTO/otp.validate.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}


     @Post('register')
        async registerUser(
         @Body() registerDto: CreateAdminDto,
         @Res({ passthrough: true }) res: Response,
        ) {
        const { msg, accessToken, admin } = await this.adminService.registerUser(registerDto);

        res.cookie('auth_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        });

         return { msg, admin };
        }
    
        @Post('login')
        async login(
            @Body()loginDto : LoginDTO,
            @Res({ passthrough :true }) res: Response
        ){
            const { msg, accessToken, admin } = await this.adminService.loginAdmin(loginDto)

               res.cookie('auth_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        })

        return { msg, admin }
        }
    
        @Post('refresh-token')
        async refreshToken(
            @Req() req,
            @Res({ passthrough :true }) res: Response
        ){
            const adminId = req.user._id

            const { msg } = await this.adminService.refreshAccessToken(adminId)

            return { msg }
        }
    
        @Post('validate-otp')
        async validateOTP(
            @Body() data: ValidateDTO
        ){
            return this.adminService.validateOTP(data)
        }
    
    
        @Post('request-otp')
        async requestOTP(
            @Body() email: string
        ){
            return this.adminService.requestOTP(email)
        }

        @Post('make-super-admin')
        async makeSureAdmin(
            @Body () adminId: string,
        ) 
        {
            return await this.adminService.makeSuperAdmin(adminId);
          
        }

        @Post('logout')
        async logout(
            @Res({ passthrough: true }) res: Response
        ) {
            res.clearCookie('auth_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            return { msg: 'Logout successful' };
        }

    }
