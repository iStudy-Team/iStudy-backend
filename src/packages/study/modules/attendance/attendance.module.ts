import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, AttendanceService],
    exports: [AttendanceService],
    controllers: [AttendanceController],
})
export class AttendanceModule {}
