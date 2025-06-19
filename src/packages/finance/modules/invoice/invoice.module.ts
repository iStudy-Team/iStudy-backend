import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, InvoiceService],
    exports: [InvoiceService],
    controllers: [InvoiceController],
})
export class InvoiceModule {}
