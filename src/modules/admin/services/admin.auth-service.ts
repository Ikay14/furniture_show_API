import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Admin, AdminDocument } from '../model/admin.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { GenerateOTP } from 'src/utils/generate.otp';
import { CreateAdminDto } from '../DTO/create-admin.dto';
import { LoginDTO } from '../DTO/login.admin-dto';
import * as bcrypt from 'bcrypt';
import { ValidateDTO } from 'src/modules/user/DTO/otp.validate.dto';


@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        private jwtService: JwtService,
    ) {}


     async handleOAuthLogin(profileData: any, isAdmin: boolean) {
    // Find or create admin user
    let admin = await this.adminModel.findOne({ email: profileData.email })

    if (!admin) {
      admin = await this.adminModel.create({
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        picture: profileData.picture,
        provider: 'google',
        role: isAdmin ? 'admin' : 'user', // 👈 Assign role conditionally
        isVerified: true,
      })
    }

    // Generate user app's own access token
    const accessToken = await this.generateAccessToken(admin)

    return {
      msg: 'Login successful',
      admin,
      accessToken,
    };
  }



    async registerUser(registerDto: CreateAdminDto):Promise<{  
            msg: string;
            accessToken: string;
            admin: Partial<Admin>;
        }> {
    
            const { email, password } = registerDto

            const admin = await this.adminModel.findOne({ email })
            if(admin) throw new BadRequestException(`Admin with ${email} exists, please proceed to login`)

            const otp = GenerateOTP()


            const hashPassword = await bcrypt.hash(password, 10)
            const hashOTP = await bcrypt.hash(otp,10)
            
            const otpExp = new Date(Date.now() + 10 * 60 * 1000)

            const newAdmin = await new this.adminModel({
                email,
                password: hashPassword,
                otp: hashOTP,
                otpExpires: otpExp
            })

             const accessToken = await this.generateAccessToken(newAdmin)
            return {
                msg: 'new admin created successfully',
                accessToken,
                admin: newAdmin.sanitize()
            }
        }

        async loginAdmin(loginDto: LoginDTO): Promise<{ msg: string, accessToken: string; admin: Partial<Admin>; }> {
            const { email, password } = loginDto
            const admin = await this.adminModel.findOne({ email });
            if (!admin) throw new BadRequestException(`Admin with ${email} not found`);

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) throw new BadRequestException(`Invalid credentials`);

            const accessToken = await this.generateAccessToken(admin);
            return {
                msg: 'admin login successful',
                accessToken,
                admin
            };
        }
    
    
        async validateOTP(valOTPDto: ValidateDTO): Promise<{ msg: string }> {
            const { email, otp } = valOTPDto
            
            try {
                    const admin = await this.adminModel.findOne({ email });
            if (!admin) throw new BadRequestException(`Admin with ${email} not found`);

            const isOTPExpired = admin.otpExpires < new Date();
            if (isOTPExpired) throw new BadRequestException(`OTP has expired, please request a new one`);

            const isMatch = await bcrypt.compare(otp, admin.otp);
            if (!isMatch) throw new BadRequestException(`Invalid OTP`);
    
            // If OTP is valid, clear the OTP and its expiration
            admin.otp = ''
            admin.otpExpires = new Date(0) // Set to a past date to indicate expiration
            await admin.save();
            return {
                msg: 'OTP validated successfully'
            };
            } catch (error) {
                throw new InternalServerErrorException(error)
            }
        
        }
    
    
        async requestOTP(email: string): Promise<{ msg: string; otp: string }> {
            const admin = await this.adminModel.findOne({ email });
            if (!admin) throw new BadRequestException(`Admin with ${email} not found`);

            const otp = GenerateOTP();
            admin.otp = await bcrypt.hash(otp, 10);
            admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await admin.save();

            return {
                msg: 'OTP sent successfully',
                otp
            };
        }

        async refreshAccessToken(adminId: string): Promise<{ msg: string, accessToken: string }> {
            const admin = await this.adminModel.findOne({ _id: adminId });
            if (!admin) throw new BadRequestException(`Admin with ID ${adminId} not found`);
            const accessToken = await this.generateAccessToken(admin);
            return {
                msg: 'access_token',
                accessToken
            };
        }
    
    async makeSuperAdmin(adminId: string): Promise<{ msg: string }> {
        const admin = await this.adminModel.findOne({ _id: adminId });
        if (!admin) throw new BadRequestException(`Admin with ID ${adminId} not found`);

        admin.roles.push('super-admin');
        await admin.save();

        return {
            msg: 'Admin promoted to super-admin successfully'
        };
    }

    private async generateAccessToken(admin: Admin){
            const payload = {
                id: admin._id,
                email: admin.email,
                roles: admin.roles,
            }
    
            return this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '10d'
            })
        }
}
