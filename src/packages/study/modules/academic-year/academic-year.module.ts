import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { AcademicYearService } from './academic-year.service';
import { AcademicYearController } from './academic-year.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, AcademicYearService],
    controllers: [AcademicYearController],
    exports: [AcademicYearService],
})
export class AcademicYearModule {}
