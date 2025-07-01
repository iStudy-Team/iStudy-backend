import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { NotificationRecipientService } from './notification-recipient.service';
import { NotificationRecipientController } from './notification-recipient.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, GenerateIdService, NotificationRecipientService],
    controllers: [NotificationRecipientController],
    exports: [NotificationRecipientService],
})
export class NotificationRecipientModule {}
