import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateMutipleInvoiceDto } from './dto/create-multiple-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { SearchInvoicesDto } from './dto/search-invoice.dto';
import { User } from '@prisma/client';

@Injectable()
export class InvoiceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async create(createInvoiceDto: CreateInvoiceDto, user: User) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create an invoice'
            );
        }

        const studentExists = await this.prisma.student.findFirst({
            where: { id: createInvoiceDto.student_id },
            include: {
                user: true,
            },
        });

        if (!studentExists) {
            throw new NotFoundException('Student not found');
        }

        try {
            // Calculate final amount using the utility method
            const finalAmount = this.calculateFinalAmount(
                createInvoiceDto.amount,
                createInvoiceDto?.discount_amount || 0,
                studentExists.discount_percentage?.toNumber() || 0
            );

            const invoice = await this.prisma.invoice.create({
                data: {
                    ...createInvoiceDto,
                    id: this.generateIdService.generateId(),
                    issue_date: createInvoiceDto.issue_date
                        ? new Date(createInvoiceDto.issue_date)
                        : new Date(),
                    due_date: createInvoiceDto.due_date
                        ? new Date(createInvoiceDto.due_date)
                        : (() => {
                              const date = new Date();
                              date.setDate(date.getDate() + 30);
                              return date;
                          })(),
                    final_amount: finalAmount,
                },
            });
            return invoice;
        } catch (error) {
            throw new InternalServerErrorException('Failed to create invoice');
        }
    }

    async findAll(
        studentId: string,
        user: User,
        searchParams?: SearchInvoicesDto
    ) {
        const { page, limit } = searchParams || { page: 1, limit: 100 };
        try {
            const skip = ((page || 1) - 1) * (limit || 100);
            const take = limit;
            if (user.role !== 4) {
                const invoices = await this.prisma.invoice.findMany({
                    where: {
                        student_id: studentId,
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                    skip,
                    take,
                    include: {
                        student: {
                            select: {
                                id: true,
                                full_name: true,
                            },
                        },
                        payments: {
                            include: {
                                receivedBy: {
                                    select: {
                                        id: true,
                                        username: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return {
                    invoices,
                    page,
                    limit,
                    total: invoices.length,
                };
            } else {
                const invoices = await this.prisma.invoice.findMany({
                    orderBy: {
                        created_at: 'desc',
                    },
                    skip,
                    take,
                    include: {
                        student: true,
                        payments: {
                            include: {
                                receivedBy: {
                                    select: {
                                        id: true,
                                        username: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return {
                    invoices,
                    page,
                    limit,
                    total: invoices.length,
                };
            }
        } catch (error) {
            console.error('Error retrieving invoices:', error);
            throw new InternalServerErrorException(
                'Failed to retrieve invoices'
            );
        }
    }

    async findOne(id: string, user: User, student_id: string) {
        try {
            const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                student: true,
                payments: {
                    include: {
                        receivedBy: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }
        if (user.role !== 4 && invoice.student_id !== student_id) {
            throw new ForbiddenException(
                'You do not have permission to view this invoice'
            );
        }
        return invoice;
        } catch (error) {
            console.error('Error retrieving invoice:', error);
            throw new InternalServerErrorException('Failed to retrieve invoice');
        }
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        discount_percentage: true,
                    },
                },
            },
        });
        if (!existingInvoice) {
            throw new NotFoundException('Invoice not found');
        }

        try {
            // Calculate final amount using the utility method
            const originalAmount =
                updateInvoiceDto.amount ||
                existingInvoice.amount?.toNumber() ||
                0;
            const invoiceDiscountPercentage =
                updateInvoiceDto?.discount_amount ||
                existingInvoice.discount_amount?.toNumber() ||
                0;
            const studentDiscountPercentage =
                existingInvoice.student.discount_percentage?.toNumber() || 0;

            const finalAmount = this.calculateFinalAmount(
                originalAmount,
                invoiceDiscountPercentage,
                studentDiscountPercentage
            );

            const updatedInvoice = await this.prisma.invoice.update({
                where: { id },
                data: {
                    ...updateInvoiceDto,
                    final_amount: finalAmount,
                },
            });
            return updatedInvoice;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update invoice');
        }
    }

    async createMultiple(
        createMutipleInvoiceDto: CreateMutipleInvoiceDto,
        user: User
    ) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create multiple invoices'
            );
        }

        const classes = await this.prisma.class.findMany({
            where: {
                id: createMutipleInvoiceDto.class_id,
            },
            include: {
                class_enrollments: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                discount_percentage: true,
                            },
                        },
                    },
                },
            },
        });

        const students = classes.flatMap((classItem) =>
            classItem.class_enrollments.map((enrollment) => enrollment.student)
        );

        if (students.length === 0) {
            throw new NotFoundException('No students found for the class');
        }

        const invoices = students.map((student, index) => {
            // Calculate final amount using the utility method
            const finalAmount = this.calculateFinalAmount(
                createMutipleInvoiceDto.amount,
                createMutipleInvoiceDto?.discount_amount || 0,
                student.discount_percentage?.toNumber() || 0
            );

            return {
                ...createMutipleInvoiceDto,
                id: this.generateIdService.generateId(),
                student_id: student.id,
                issue_date: createMutipleInvoiceDto.issue_date
                    ? new Date(createMutipleInvoiceDto.issue_date)
                    : new Date(),
                invoice_number: `${createMutipleInvoiceDto.invoice_number}-${index + 1}`,
                due_date: createMutipleInvoiceDto.due_date
                    ? new Date(createMutipleInvoiceDto.due_date)
                    : (() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 30);
                          return date;
                      })(),
                final_amount: finalAmount,
            };
        });

        try {
            const createdInvoices = await this.prisma.invoice.createMany({
                data: invoices,
            });
            return {
                message: `${createdInvoices.count} invoices created successfully`,
                invoices: invoices.map((invoice) => ({
                    ...invoice,
                    final_amount: this.calculateFinalAmount(
                        invoice.amount,
                        invoice.discount_amount || 0,
                        students.find((s) => s.id === invoice.student_id)
                            ?.discount_percentage?.toNumber() || 0
                    ),
                })),
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create multiple invoices'
            );
        }
    }

    /**
     * Calculate final invoice amount after applying discounts
     * @param originalAmount - The base amount before discounts
     * @param invoiceDiscountPercentage - Invoice-specific discount percentage (stored as discount_amount in DB)
     * @param studentDiscountPercentage - Student-specific discount percentage
     * @returns Final amount after both discounts are applied
     */
    private calculateFinalAmount(
        originalAmount: number,
        invoiceDiscountPercentage: number = 0,
        studentDiscountPercentage: number = 0
    ): number {
        const invoiceDiscountAmount =
            (originalAmount * invoiceDiscountPercentage) / 100;
        const studentDiscountAmount =
            (originalAmount * studentDiscountPercentage) / 100;
        const finalAmount =
            originalAmount - invoiceDiscountAmount - studentDiscountAmount;

        // Ensure final amount is not negative
        return Math.max(0, finalAmount);
    }
}
