import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { ClassTeacherModule } from '../class-teacher/class-teacher.module';

@Module({
    imports: [AuthModule, ClassTeacherModule],
    providers: [PrismaService, GenerateIdService, ClassService],
    exports: [ClassService],
    controllers: [ClassController],
})
export class ClassModule {}
