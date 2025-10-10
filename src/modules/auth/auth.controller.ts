import { Controller, Body, Post, Res, Get, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '../user/model/user.model';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from '../user/DTO/register.user.dto';
import { LoginDTO } from '../user/DTO/login.user.dto';
import { ValidateDTO } from '../user/DTO/otp.validate.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RequestOtpDto } from '../user/DTO/request.dto';
import { FORGOT_PASSWORD_DTO } from '../user/DTO/forgot-password.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google OAuth login for user' })
    googleLogin() {}

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Handle Google OAuth redirect and login' })
    @ApiResponse({ status: 200, description: 'OAuth login successful' })
    async googleRedirect(@Req() req) {
        return this.authService.handleOAuthLogin(req.user);
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    async registerUser(
        @Body() registerDto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { msg, accessToken, user } = await this.authService.registerUser(registerDto);

        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        return { msg, user };
    }

    @Post('login')
    @ApiOperation({ summary: 'Login as user' })
    @ApiBody({ type: LoginDTO })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    async login(
        @Body() loginDto: LoginDTO,
        @Res({ passthrough: true }) res: Response
    ) {
        const { msg, accessToken, user } = await this.authService.loginUser(loginDto);

        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        return { msg, user };
    }

    @Post('request-password') 
    @ApiOperation({ summary: 'Request Reset Password' })
    @ApiBody({ type: FORGOT_PASSWORD_DTO })
    @ApiResponse({ status: 200, description: 'Reset Password Sent successfully' })
    async requestForgotPassword(
        @Body() dto: FORGOT_PASSWORD_DTO
    ) {
        return await this.authService.RequestForgetPassword(dto)
    }

    @Post('refresh-token') 
    @ApiOperation({ summary: 'Refresh user access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    async refreshToken(
        @Req() req,
        @Res({ passthrough: true }) res: Response
    ) {
        const userId = req.user._id;

        const { msg } = await this.authService.refeshAccessToken(userId);

        return { msg };
    }

    @Post('validate-otp')
    @ApiOperation({ summary: 'Validate OTP for user' })
    @ApiBody({ type: ValidateDTO })
    @ApiResponse({ status: 200, description: 'OTP validated successfully' })
    async validateOTP(
        @Body() data: ValidateDTO
    ) {
        return this.authService.validateOTP(data);
    }

    @Post('request-otp')
    @ApiOperation({ summary: 'Request OTP for user email' })
    @ApiBody({ type: String, description: 'User email' })
    @ApiResponse({ status: 200, description: 'OTP requested successfully' })
    async requestOTP(
        @Body() dto: RequestOtpDto
    ){
        return this.authService.requestOTP(dto)
    }


}
