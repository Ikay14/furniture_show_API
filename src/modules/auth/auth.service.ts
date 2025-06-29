import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../user/model/user.model';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../user/DTO/register.user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { GenerateOTP } from 'src/utils/generate.otp';

@Injectable()
export class AuthService {
    constructor (
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private configService: ConfigService,
        private jwtService: JwtService
    ) {}


    async registerUser(registerDto: RegisterDto):Promise<{ }> {

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

         const accessToken = this.generateAccessToken(newUser)
        return {
            msg: 'new user created successfully',
            newUser
        }
    }

    private async generateAccessToken(user: User){
        const payload = {
            id: user._id,
            email: user.email
        }

        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '10d'
        })
    }
}
