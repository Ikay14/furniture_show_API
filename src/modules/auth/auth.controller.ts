import { Controller, Body, Post, Res, Get, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '../user/model/user.model';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from '../user/DTO/register.user.dto';
import { LoginDTO } from '../user/DTO/login.user.dto';
import { ValidateDTO } from '../user/DTO/otp.validate.dto';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {}

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleRedirect(@Req() req) {
    return this.authService.handleOAuthLogin(req.user);
    }

    @Post('register')
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
    async login(
        @Body()loginDto : LoginDTO,
        @Res({ passthrough :true }) res: Response
    ){
        const { msg, accessToken, user } = await this.authService.loginUser(loginDto)

           res.cookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    })

    return { msg, user }
    }

    @Post('refresh-token')
    async refreshToken(
        @Req() req,
        @Res({ passthrough :true }) res: Response
    ){
        const userId = req.user._id

        const { msg } = await this.authService.refeshAccessToken(userId)

        return { msg }
    }

    @Post('validate-otp')
    async validateOTP(
        @Body() data: ValidateDTO
    ){
        return this.authService.validateOTP(data)
    }


    @Post('request-otp')
    async requestOTP(
        @Body() email: string
    ){
        return this.authService.requestOTP(email)
    }


}
