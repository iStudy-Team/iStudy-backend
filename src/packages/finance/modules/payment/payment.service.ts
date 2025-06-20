import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SearchPaymentsDto } from './dto/search-payment.dto';
import { User } from '@prisma/client';
import { InvoiceStatusEnum } from '../../types/invoice';
import { SePayService } from '../sepay/sepay.service';

@Injectable()
export class PaymentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService,
        private readonly sePayService: SePayService
    ) {}

    async create(createPaymentDto: CreatePaymentDto, user: User) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create a payment'
            );
        }

        const existingPayment = await this.prisma.invoice.findUnique({
            where: { id: createPaymentDto.invoice_id },
        });

        if (existingPayment?.status === InvoiceStatusEnum.PAID) {
            throw new ConflictException('This invoice has already been paid');
        }

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: createPaymentDto.invoice_id },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        if (existingPayment?.status === InvoiceStatusEnum.UNPAID) {
            const dataQR = await this.sePayService.createQR(
                Number(invoice.final_amount),
                existingPayment.id
            );

            return {
                ...existingPayment,
                invoice: {
                    id: invoice.id,
                    student_id: invoice.student_id,
                    status: invoice.status,
                    final_amount: invoice.final_amount,
                },
                receivedBy: {
                    id: user.id,
                    username: user.username,
                },
                dataQR,
            };
        }
        try {
            const payment = await this.prisma.payment.create({
                data: {
                    ...createPaymentDto,
                    id: this.generateIdService.generateId(),
                    payment_date: createPaymentDto.payment_date
                        ? new Date(createPaymentDto.payment_date)
                        : new Date(),
                },
            });

            const dataQR = await this.sePayService.createQR(
                Number(invoice.final_amount),
                payment.id
            );

            return {
                ...payment,
                invoice: {
                    id: invoice.id,
                    student_id: invoice.student_id,
                    status: invoice.status,
                    final_amount: invoice.final_amount,
                },
                receivedBy: {
                    id: user.id,
                    username: user.username,
                },
                dataQR,
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to create payment');
        }
    }

    async findAll(user: User, searchParams?: SearchPaymentsDto) {
        const { page, limit } = searchParams || { page: 1, limit: 10 };
        try {
            const skip = (page || 1 - 1) * (limit || 10);
            if (user.role !== 4) {
                const payments = await this.prisma.payment.findMany({
                    where: { received_by: user.id },
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' },
                    include: {
                        invoice: {
                            select: {
                                id: true,
                                student_id: true,
                                status: true,
                                final_amount: true,
                            },
                        },
                        receivedBy: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                });
                return {
                    payments,
                    total: await this.prisma.payment.count({
                        where: { received_by: user.id },
                    }),
                    page: page || 1,
                    limit: limit || 10,
                };
            } else {
                const payments = await this.prisma.payment.findMany({
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' },
                    include: {
                        invoice: {
                            select: {
                                id: true,
                                student_id: true,
                                status: true,
                                final_amount: true,
                            },
                        },
                        receivedBy: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                });
                return {
                    payments,
                    total: await this.prisma.payment.count(),
                    page: page || 1,
                    limit: limit || 10,
                };
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch payments');
        }
    }

    async findOne(id: string, user: User) {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { id },
                include: {
                    invoice: {
                        select: {
                            id: true,
                            student_id: true,
                            status: true,
                            final_amount: true,
                        },
                    },
                    receivedBy: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            });
            if (!payment) {
                throw new NotFoundException('Payment not found');
            }
            if (user.role !== 4 && payment.received_by !== user.id) {
                throw new ForbiddenException(
                    'You do not have permission to view this payment'
                );
            }
            return payment;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch payment');
        }
    }

    async updatePaymentStatusToOverDue(paymentId: string) {
        try {
            const payment = await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: InvoiceStatusEnum.OVERDUE },
            });
            if (!payment) {
                throw new NotFoundException('Payment not found');
            }
            return payment;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update payment status'
            );
        }
    }
}
