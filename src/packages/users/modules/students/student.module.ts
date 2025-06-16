import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, GenerateIdService, StudentService],
    exports: [StudentService],
    controllers: [StudentController],
})
export class StudentModule {}
