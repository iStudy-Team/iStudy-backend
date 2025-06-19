import { InvoiceModule } from './modules/invoice/invoice.module';
import { Module } from '@nestjs/common';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
    imports: [InvoiceModule, PaymentModule],
    exports: [InvoiceModule, PaymentModule],
})
export class FinanceModule {}
