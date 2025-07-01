import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, GenerateIdService, AnnouncementService],
    controllers: [AnnouncementController],
    exports: [AnnouncementService],
})
export class AnnouncementModule {}
