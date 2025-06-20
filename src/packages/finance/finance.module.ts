import { InvoiceModule } from './modules/invoice/invoice.module';
import { Module } from '@nestjs/common';
import { PaymentModule } from './modules/payment/payment.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
    imports: [InvoiceModule, PaymentModule, WebhookModule],
    exports: [InvoiceModule, PaymentModule, WebhookModule],
})
export class FinanceModule {}
