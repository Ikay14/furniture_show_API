import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { client, initializeDatabase,  } from './config/db.config';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/global-Interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{
    bufferLogs: true,
    logger: new ConsoleLogger({
    prefix: 'ShopFurYou_API',
    logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
  }),
  }); 

  // Initialize the database connection

  try {
  await initializeDatabase()
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1); 
  }

  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }

    const config = new DocumentBuilder()
    .setTitle('ShopFurYou API')
    .setDescription('API documentation for ShopFurYou')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`${process.env.BASE_URL || 'http://localhost:3000'}/api/v1`)
    .build();

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)


  app.use('/payment/webhook', bodyParser.raw({ type: '*/*' }));

  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.useGlobalPipes(new ValidationPipe({transform: true}))

  app.enable('trust proxy')

  app.setGlobalPrefix('api/v1', { exclude : [ 'api', 'api/v1', 'api/docs', 'payment/webhook' ] })

  app.useGlobalInterceptors(new TransformInterceptor())

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3001

  await app.listen(port, '0.0.0.0')
  console.log(`Swagger is running at http://localhost:${port}/api/docs`);
  console.log({ message: 'server started!', port, url: `http://localhost:${port}/api/v1` });


}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error)
  process.exit(1); 
}) 
