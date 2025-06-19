import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
    imports: [AuthModule, InvoiceModule],
    providers: [PrismaService, GenerateIdService, PaymentService],
    exports: [PaymentService],
    controllers: [PaymentController],
})
export class PaymentModule {}
