import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { StudentStatisticController } from './student-statistic.controller';
import { StudentStatisticService } from './student-statistic.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [StudentStatisticController],
    providers: [StudentStatisticService, PrismaService, GenerateIdService],
    exports: [StudentStatisticService],
})
export class StudentStatisticModule {}
