import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/model/user.model';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from 'src/stratgey/google.strategy';
@Module({
  imports:[

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, GoogleStrategy]
})
export class AuthModule {}
  