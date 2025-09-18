import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/model/user.model';
import { JwtStrategy } from 'src/stratgey/jwt.strategy';
import { GoogleStrategy } from 'src/stratgey/google.strategy';
import { MailService } from 'src/services/email.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, 
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService, GoogleStrategy],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
  