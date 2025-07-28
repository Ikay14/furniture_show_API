import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { User, UserDocument } from '../user/model/user.model';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../user/DTO/register.user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { GenerateOTP } from 'src/utils/generate.otp';
import { LoginDTO } from '../user/DTO/login.user.dto';
import { ValidateDTO } from '../user/DTO/otp.validate.dto';

@Injectable()
export class AuthService {
    constructor (
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private configService: ConfigService,
        private jwtService: JwtService
    ) {}


    async registerUser(registerDto: RegisterDto):Promise<{  
        msg: string;
        accessToken: string;
        user: Partial<User>;
    }> {

        const { email, password } = registerDto

        const user = await this.userModel.findOne({ email })
        if(user) throw new BadRequestException(`User with ${email} exists, please proceed to login`) 

        const otp = GenerateOTP()    
       
        
        const hashPassword = await bcrypt.hash(password, 10)
        const hashOTP = await bcrypt.hash(otp,10)
        
        const otpExp = new Date(Date.now() + 10 * 60 * 1000)

        const newUser = await new this.userModel({
            email,
            password: hashPassword,
            otp: hashOTP,
            otpExpires: otpExp
        })

         const accessToken = await this.generateAccessToken(newUser)
        return {
            msg: 'new user created successfully',
            accessToken,
            user: newUser.sanitize()
        }
    }

    async loginUser(loginDto: LoginDTO): Promise<{ msg: string, accessToken: string; user: Partial<User>; }> {
        const { email, password } = loginDto
        const user = await this.userModel.findOne({ email });
        if (!user) throw new BadRequestException(`User with ${email} not found`);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestException(`Invalid credentials`);

        const accessToken = await this.generateAccessToken(user);
        return {
            msg: 'user login successful',
            accessToken,
            user
        };
    }


    async validateOTP(valOTPDto: ValidateDTO): Promise<{ msg: string }> {
        const { email, otp } = valOTPDto
        
        try {
                const user = await this.userModel.findOne({ email });
        if (!user) throw new BadRequestException(`User with ${email} not found`);

        const isOTPExpired = user.otpExpires < new Date();
        if (isOTPExpired) throw new BadRequestException(`OTP has expired, please request a new one`);

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) throw new BadRequestException(`Invalid OTP`);

        // If OTP is valid, clear the OTP and its expiration
        user.otp = ''
        user.otpExpires = new Date(0) // Set to a past date to indicate expiration
        user.isVerified = true
        await user.save();
        return {
            msg: 'OTP validated successfully'
        };
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    
    }


    async requestOTP(email: string): Promise<{ msg: string; otp: string }> {
        const user = await this.userModel.findOne({ email });
        if (!user) throw new BadRequestException(`User with ${email} not found`);

        const otp = GenerateOTP();
        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

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
        const payload = {
            id: user._ids,
            email: user.email
        }

        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '10d'
        })
    }
}
