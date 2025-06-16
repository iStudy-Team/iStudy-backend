import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ClassTeacherService } from './class-teacher.service';
import { ClassTeacherController } from './class-teacher.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, ClassTeacherService],
    exports: [ClassTeacherService],
    controllers: [ClassTeacherController],
})
export class ClassTeacherModule {}
