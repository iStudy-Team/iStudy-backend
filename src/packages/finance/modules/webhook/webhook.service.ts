import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { Webhook } from '../../types/webhook';
import { getPaymentIdFromWebhook } from '../../utils/handleWebHook';
import { InvoiceStatusEnum } from '../../types/invoice';

@Injectable()
export class WebhookService {
    constructor(private readonly prisma: PrismaService) {}

    async processWebhook(data: Webhook) {
        const amountIn = data.transferType === 'in' ? data.transferAmount : 0;

        const paymentId = getPaymentIdFromWebhook(data.content);

        // update payment status
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                invoice: true,
            },
        });
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status === InvoiceStatusEnum.PAID) {
            throw new ConflictException(
                'This payment has already been processed'
            );
        }

        if (payment.status === InvoiceStatusEnum.CANCELLED) {
            throw new ForbiddenException(
                'This payment has been canceled and cannot be processed'
            );
        }

        if (payment.status === InvoiceStatusEnum.OVERDUE) {
            throw new ForbiddenException(
                'This payment is overdue and cannot be processed'
            );
        }

        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: InvoiceStatusEnum.PAID,
                amount: amountIn,
                notes: data.description,
            },
        });

        if (payment.amount.equals(payment.invoice.final_amount)) {
            await this.prisma.invoice.update({
                where: { id: payment.invoice_id },
                data: {
                    status: InvoiceStatusEnum.PAID,
                },
            });
        }

        return { success: true };
    }
}
