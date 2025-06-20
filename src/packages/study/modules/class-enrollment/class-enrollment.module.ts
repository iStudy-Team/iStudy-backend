import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ClassEnrollmentService } from './class-enrollment.service';
import { ClassEnrollmentController } from './class-enrollment.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, ClassEnrollmentService],
    exports: [ClassEnrollmentService],
    controllers: [ClassEnrollmentController],
})
export class ClassEnrollmentModule {}
