import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeacherService } from './teacher.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { TeacherController } from './teacher.controller';
import { AuthModule } from 'src/packages/auth/auth.module';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, TeacherService, GenerateIdService],
    controllers: [TeacherController],
    exports: [TeacherService],
})
export class TeacherModule {}
