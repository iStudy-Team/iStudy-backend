import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, ScheduleService],
    controllers: [ScheduleController],
    exports: [ScheduleService],
})
export class ScheduleModule {}
