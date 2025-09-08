import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/model/user.model';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from 'src/stratgey/google.strategy';
import { MailService } from 'src/services/email.service';
@Module({
  imports:[

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, MailService, GoogleStrategy]
})
export class AuthModule {}
  