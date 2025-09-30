import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User } from 'src/modules/user/model/user.model';
import { Vendor } from 'src/modules/vendor/model/vendor.model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['auth-token']
      ]),
      
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') 
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    let vendor: Vendor | null = null;

     if (user.role === 'vendor') 
      vendor = await this.vendorModel.findById(user._id).populate('vendor');
    
    return { user, vendor };
}
}