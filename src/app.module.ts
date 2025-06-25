import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Server } from 'http';
import { Mongoose } from 'mongoose';
import serverConfig from './config/server.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load : [serverConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService : ConfigService) =>({
        uri: configService.get<string>('MONGO_URI')
      }), 
      inject: [ConfigService],
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
