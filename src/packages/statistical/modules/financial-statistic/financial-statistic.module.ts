import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { FinancialStatisticController } from './financial-statistic.controller';
import { FinancialStatisticService } from './financial-statistic.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [FinancialStatisticController],
    providers: [FinancialStatisticService, PrismaService, GenerateIdService],
    exports: [FinancialStatisticService],
})
export class FinancialStatisticModule {}
