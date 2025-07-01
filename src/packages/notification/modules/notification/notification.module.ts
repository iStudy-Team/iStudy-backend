import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, GenerateIdService, NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
