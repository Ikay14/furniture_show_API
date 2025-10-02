import { Module } from '@nestjs/common';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { User, UserSchema } from './model/user.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ])
    ],
    providers: [UserService, CloudinaryService],
    controllers: [UserController]
})
export class UserModule {}
