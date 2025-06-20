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
        try {
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
                    final_amount: createInvoiceDto.final_amount || 0,
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
        const { page, limit } = searchParams || { page: 1, limit: 10 };
        try {
            const skip = (page || 1 - 1) * (limit || 10);
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
                            select: {
                                id: true,
                                amount: true,
                                payment_date: true,
                            },
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
                        student: {
                            select: {
                                id: true,
                                full_name: true,
                            },
                        },
                        payments: {
                            select: {
                                id: true,
                                amount: true,
                                payment_date: true,
                            },
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
            throw new InternalServerErrorException(
                'Failed to retrieve invoices'
            );
        }
    }

    async findOne(id: string, user: User, student_id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        payment_date: true,
                    },
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
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { id },
        });
        if (!existingInvoice) {
            throw new NotFoundException('Invoice not found');
        }

        try {
            const updatedInvoice = await this.prisma.invoice.update({
                where: { id },
                data: updateInvoiceDto,
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
                        student: true,
                    },
                },
            },
        });

        const studentIds = classes.flatMap((classItem) =>
            classItem.class_enrollments.map(
                (enrollment) => enrollment.student.id
            )
        );

        if (studentIds.length === 0) {
            throw new NotFoundException('No students found for the class');
        }

        const invoices = studentIds.map((studentId) => ({
            ...createMutipleInvoiceDto,
            id: this.generateIdService.generateId(),
            student_id: studentId,
            issue_date: createMutipleInvoiceDto.issue_date
                ? new Date(createMutipleInvoiceDto.issue_date)
                : new Date(),
            due_date: createMutipleInvoiceDto.due_date
                ? new Date(createMutipleInvoiceDto.due_date)
                : (() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 30);
                      return date;
                  })(),
            final_amount: createMutipleInvoiceDto.final_amount || 0,
        }));

        try {
            const createdInvoices = await this.prisma.invoice.createMany({
                data: invoices,
            });
            return {
                message: `${createdInvoices.count} invoices created successfully`,
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create multiple invoices'
            );
        }
    }
}
