import { Body, Controller, Post, Req, Res, UseGuards, Get, Query } from '@nestjs/common';
import { CreateAdminDto } from '../DTO/create-admin.dto';
import { LoginDTO } from 'src/modules/user/DTO/login.user.dto';
import { Response } from 'express';
import { AdminService } from '../services/admin.auth-service';
import { ValidateDTO } from 'src/modules/user/DTO/otp.validate.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google OAuth login for admin' })
    googleLogin() {}

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Handle Google OAuth redirect and login' })
    @ApiQuery({ name: 'state', required: false, type: String, description: 'Context for OAuth (admin or user)' })
    @ApiResponse({ status: 200, description: 'OAuth login successful' })
    async googleRedirect(@Req() req, @Query('state') state: string) {
        const isAdmin = state === 'admin';
        return this.adminService.handleOAuthLogin(req.user, isAdmin);
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new admin' })
    @ApiBody({ type: CreateAdminDto })
    @ApiResponse({ status: 201, description: 'Admin registered successfully' })
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
    @ApiOperation({ summary: 'Login as admin' })
    @ApiBody({ type: LoginDTO })
    @ApiResponse({ status: 200, description: 'Admin logged in successfully' })
    async login(
        @Body() loginDto: LoginDTO,
        @Res({ passthrough: true }) res: Response
    ) {
        const { msg, accessToken, admin } = await this.adminService.loginAdmin(loginDto);

        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        return { msg, admin };
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh admin access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    async refreshToken(
        @Req() req,
        @Res({ passthrough: true }) res: Response
    ) {
        const adminId = req.user._id;
        const { msg } = await this.adminService.refreshAccessToken(adminId);
        return { msg };
    }

    @Post('validate-otp')
    @ApiOperation({ summary: 'Validate OTP for admin' })
    @ApiBody({ type: ValidateDTO })
    @ApiResponse({ status: 200, description: 'OTP validated successfully' })
    async validateOTP(
        @Body() data: ValidateDTO
    ) {
        return this.adminService.validateOTP(data);
    }

    @Post('request-otp')
    @ApiOperation({ summary: 'Request OTP for admin email' })
    @ApiBody({ type: String, description: 'Admin email' })
    @ApiResponse({ status: 200, description: 'OTP requested successfully' })
    async requestOTP(
        @Body() email: string
    ) {
        return this.adminService.requestOTP(email);
    }

    @Post('make-super-admin')
    @ApiOperation({ summary: 'Make an admin a super admin' })
    @ApiBody({ type: String, description: 'Admin ID' })
    @ApiResponse({ status: 200, description: 'Admin promoted to super admin' })
    async makeSureAdmin(
        @Body() adminId: string,
    ) {
        return await this.adminService.makeSuperAdmin(adminId);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout admin and clear auth cookie' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
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
