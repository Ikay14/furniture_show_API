import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from '../user/model/user.model';
import { RegisterDto } from '../user/DTO/register.user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { GenerateOTP } from 'src/utils/generate.otp';
import { LoginDTO } from '../user/DTO/login.user.dto';
import { ValidateDTO } from '../user/DTO/otp.validate.dto';
import { RequestOtpDto } from '../user/DTO/request.dto';
import { NotificationService } from '../notification/notification.service';
import { Logger } from '@nestjs/common';
import { CryptoUtil } from 'src/utils/crypto.util';
import { FORGOT_PASSWORD_DTO } from '../user/DTO/forgot-password.dto';

@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name)
    constructor (
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private notifyService: NotificationService
    ) {}


     async handleOAuthLogin(profileData: any) {
    // Find or create user
    let user = await this.userModel.findOne({ email: profileData.email })

    if (!user) {
        const otp = GenerateOTP();
        const hashOTP = await bcrypt.hash(String(otp), 10);
        const otpExp = new Date(Date.now() + 10 * 60 * 1000)    
      user = await this.userModel.create({
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        picture: profileData.picture,
        provider: 'google',
        otp: hashOTP,
        otpExpires: otpExp
      })

       await this.notifyService.sendWelcomeEmail({
        email: user.email,
        firstName: user.firstName,
        otp
       })

       this.logger.log('Welcome email job added to the queue');
       
    }

    // Generate user app's own access token
    const accessToken = await this.generateAccessToken(user)

    return {
      msg: 'Login successful',
      user,
      accessToken,
    };
  }


    async registerUser(registerDto: RegisterDto):Promise<{  
        msg: string;
        accessToken: string;
        user: Partial<User>;
    }> {

        const { email, password } = registerDto

        const user = await this.getuserByEmail(email)
        if(user) throw new BadRequestException(`User with ${email} exists, please proceed to login`) 

        const otp = GenerateOTP();

        const hashPassword = await CryptoUtil.hashPassword(password)
        const hashOTP = await CryptoUtil.hashOTP(otp)

        const otpExp = CryptoUtil.expireOTP()

        const newUser = await new this.userModel({
            email,
            password: hashPassword,
            otp: hashOTP,
            otpExpires: otpExp
        })

        let savedUser;
        try {
            savedUser = await newUser.save()
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

        const accessToken = await this.generateAccessToken(savedUser)

        await this.notifyService.sendWelcomeEmail({
        email: newUser.email,
        firstName: newUser.firstName,
        otp
       })
        
        return {
            msg: 'new user created successfully',
            accessToken,
            user: newUser.sanitize()
        }
    }

    async loginUser(loginDto: LoginDTO): Promise<{ msg: string, accessToken: string; user: Partial<User>; }> {
        const { email, password } = loginDto

        const user = await this.getuserByEmail(email)
        if (!user || !user.password) throw new UnauthorizedException('Invalid credentials')

        const isMatch = await CryptoUtil.verifyPassword(password, user.password)
        if (!isMatch) throw new BadRequestException(`Invalid credentials provided`);
 
        const accessToken = await this.generateAccessToken(user)

        return {
            msg: 'user login successful',
            accessToken,
            user
        };
    }

    async RequestForgetPassword(dto: FORGOT_PASSWORD_DTO):Promise<{ msg: string }>{
        const { email } = dto

        const user = await this.getuserByEmail(email)

        const resetOTP = GenerateOTP()
        
        const hashOTP = await CryptoUtil.hashOTP(resetOTP)

        const otpExp = await CryptoUtil.expireOTP()

        user.otp = hashOTP
        user.otpExpires = otpExp

        await user.save()

        await this.notifyService.sendForgotPasswordRequest({
            name: user.lastName,
            email: user.email,
            otp: resetOTP
        })

        return { msg: 'reset password sent' }
    }

    async resetPassword(otp: string){
        
    } 


    async validateOTP(valOTPDto: ValidateDTO): Promise<{ msg: string }> {
        const { email, otp } = valOTPDto
        
        const user = await this.getuserByEmail(email)

        const isOTPExpired = user.otpExpires < new Date();
        if (isOTPExpired) throw new BadRequestException(`OTP has expired, please request a new one`);

        const isMatch = await CryptoUtil.verifyOTP(otp, user.otp)
        if (!isMatch) throw new BadRequestException(`Invalid OTP`);

        // If OTP is valid, clear the OTP and its expiration
        user.otp = ''
        user.otpExpires = new Date(0) // Set to a past date to indicate expiration
        user.isVerified = true
        await user.save();
        return {
            msg: 'OTP validated successfully'
        };
}   


    async requestOTP(dto: RequestOtpDto): Promise<{ msg: string; otp: string }> {

    const { email } = dto  
    
    const user = await this.getuserByEmail(email)

    const otp = GenerateOTP();

    user.otp = await CryptoUtil.hashOTP(otp)

    user.otpExpires = await CryptoUtil.expireOTP()
    
    await user.save()
    
         await this.notifyService.sendOTP({
            email: user.email,
            firstName: user.firstName,
            otp
           })

    // 6. Return response with message and OTP
    return {
        msg: 'OTP sent successfully',
        otp  
    };
}


    async refeshAccessToken(userId: string): Promise<{ msg: string, accessToken: string }> {
        const user = await this.getUserById(userId)
        const accessToken = await this.generateAccessToken(user);
        return {
            msg: 'access_token',
            accessToken
        };
    }

   // Helpers: ********************************************************************************
    private async generateAccessToken(user: User){
        
        const payload = {
            
            id: user._id,
            email: user.email,
            role: user.roles,
        }

        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '10d'
        })
    }

    private async getUserById(userId: string): Promise<User> {
     const user = await this.userModel.findById(userId)
     if(!user) throw new NotFoundException(`${userId} not found`)
     return user 
    }

    private async getuserByEmail(email:string):Promise<User>{
        const user = await this.userModel.findOne({ email })
        if(!user) throw new NotFoundException(`${email} not found`)
        return user    
    }

}
