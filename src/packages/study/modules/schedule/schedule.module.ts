import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ClassSessionModule } from '../class-session/class-session.module';

@Module({
    imports: [AuthModule, ClassSessionModule],
    providers: [PrismaService, GenerateIdService, ScheduleService],
    controllers: [ScheduleController],
    exports: [ScheduleService],
})
export class ScheduleModule {}
