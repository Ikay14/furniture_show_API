import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['auth-token']
      ]),
      
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') 
    });
  }

  async validate(payload: any) {
    return { 
        userId: payload.sub, 
        email: payload.email,
        role: payload.role
    };
  }
}
