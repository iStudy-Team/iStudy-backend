import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: {
            origin: ['http://localhost:5173'],
            credentials: true,
        },
    });
    app.setGlobalPrefix('api/v1');
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
    console.log('Server is running on port:', process.env.PORT || 3000,  'http://localhost:3000/api');
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
