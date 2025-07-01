import { Module } from '@nestjs/common';
import { StudentStatisticModule } from './modules/student-statistic/student-statistic.module';
import { FinancialStatisticModule } from './modules/financial-statistic/financial-statistic.module';

@Module({
    imports: [StudentStatisticModule, FinancialStatisticModule],
    exports: [StudentStatisticModule, FinancialStatisticModule],
})
export class StatisticalModule {}
