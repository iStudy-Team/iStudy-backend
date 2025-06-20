import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SePayService } from '../sepay/sepay.service';
@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, PaymentService, SePayService],
    exports: [PaymentService],
    controllers: [PaymentController],
})
export class PaymentModule {}
