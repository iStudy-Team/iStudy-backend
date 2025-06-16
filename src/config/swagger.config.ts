import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('ISTUDY API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
        {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            in: 'header',
            description: 'Enter your JWT token in the format: Bearer <token>',
        },
        'JWT'
    )
    .build();
