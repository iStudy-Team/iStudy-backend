import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [ActivityLogController],
    providers: [ActivityLogService, PrismaService, GenerateIdService],
    exports: [ActivityLogService],
})
export class ActivityLogModule {}
