import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from '../user/model/user.model';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../user/DTO/register.user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Vendor } from '../vendor/model/vendor.model';
import { GenerateOTP } from 'src/utils/generate.otp';
import { LoginDTO } from '../user/DTO/login.user.dto';
import { ValidateDTO } from '../user/DTO/otp.validate.dto';
import { MailService } from 'src/services/email.service';
import { RequestOtpDto } from '../user/DTO/request.dto';
import { NotificationService } from '../notification/notifcation.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {

    private logger = new Logger(AuthService.name)
    constructor (
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
        private configService: ConfigService,
        private jwtService: JwtService,
        private mailService: MailService,
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

        const user = await this.userModel.findOne({ email })
        if(user) throw new BadRequestException(`User with ${email} exists, please proceed to login`) 

        const otp = GenerateOTP();

        const hashPassword = await bcrypt.hash(password, 10);
        const hashOTP = await bcrypt.hash(String(otp), 10);

        const otpExp = new Date(Date.now() + 10 * 60 * 1000)

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

        const user = await this.userModel.findOne({ email });
        if (!user || !user.password) throw new UnauthorizedException('Invalid credentials')

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw new BadRequestException(`Invalid credentials provided`);
 
        const accessToken = await this.generateAccessToken(user)

        return {
            msg: 'user login successful',
            accessToken,
            user
        };
    }


    async validateOTP(valOTPDto: ValidateDTO): Promise<{ msg: string }> {
        const { email, otp } = valOTPDto
        
        const user = await this.userModel.findOne({ email });
        if (!user) throw new BadRequestException(`User with ${email} not found`);

        const isOTPExpired = user.otpExpires < new Date();
        if (isOTPExpired) throw new BadRequestException(`OTP has expired, please request a new one`);

        const isMatch = await bcrypt.compare(String(otp), String(user.otp))
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
    
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException(`User with ${email} not found`);

    const otp = GenerateOTP();

    user.otp = await bcrypt.hash(otp, 10);

    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.sendEmail(
            user.email, 
            `You requested a One-Time Password (OTP)`, 
            'request.otp', 
            { name: user.firstName || 'User', email: user.email, otp } 
        )  

    await user.save()

    // 6. Return response with message and OTP
    return {
        msg: 'OTP sent successfully',
        otp  
    };
}


    async refeshAccessToken(userId: string): Promise<{ msg: string, accessToken: string }> {
        const user = await this.userModel.findOne({ userId });
        if (!user) throw new BadRequestException(`User with ID ${userId} not found`);
        const accessToken = await this.generateAccessToken(user);
        return {
            msg: 'access_token',
            accessToken
        };
    }

   
    private async generateAccessToken(user: User){

        const vendor = await this.vendorModel.findOne({ owner: user._id })
        
        const payload = {
            
            id: user._id,
            email: user.email,
            role: user.roles,
            vendorId: vendor ? vendor._id : null
        }

        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '10d'
        })
    }


         // sendMail method
    private async sendEmail(to: string, subject: string, templateName: string, data: Record<string, string> ): Promise<void> {
    await this.mailService.sendMailWithTemplate(to, subject, templateName, data);
    }

}
