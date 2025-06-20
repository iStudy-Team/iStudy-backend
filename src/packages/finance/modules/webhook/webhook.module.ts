import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, WebhookService],
    exports: [WebhookService],
    controllers: [WebhookController],
})
export class WebhookModule {}
