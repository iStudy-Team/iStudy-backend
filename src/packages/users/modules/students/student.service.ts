import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { User } from '@prisma/client';
import { InvoiceStatusEnum } from 'src/packages/finance/types/invoice';

@Injectable()
export class StudentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createStudent(createStudentDto: CreateStudentDto) {
        const existingStudent = await this.prisma.student.findFirst({
            where: { user_id: createStudentDto.user_id },
        });

        if (existingStudent) {
            throw new ConflictException('Student already exists for this user');
        }

        try {
            const student = await this.prisma.student.create({
                data: {
                    ...createStudentDto,
                    user_id: createStudentDto.user_id,
                    id: this.generateIdService.generateId(),
                    status: createStudentDto.status ?? 0, // Default to 0 if not provided
                },
            });
            return student;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create student',
                error.message
            );
        }
    }

    async updateStudent(
        id: string,
        updateStudentDto: UpdateStudentDto,
        user: User
    ) {
        const student = await this.prisma.student.findFirst({
            where: { id },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        if (student.user_id !== user.id && user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update this student'
            );
        }

        try {
            const updatedStudent = await this.prisma.student.update({
                where: { id },
                data: updateStudentDto,
            });

            if(updateStudentDto.discount_percentage) {
                // fine invoice
                const invoices = await this.prisma.invoice.findMany({
                    where: { student_id: id, status: InvoiceStatusEnum.UNPAID },
                });

                if(invoices.length > 0) {
                    const updatedInvoices = await Promise.all(
                        invoices.map(async (invoice) => {
                            const currentAmount = Number(invoice.final_amount);
                            const discountPercentage = Number(updateStudentDto.discount_percentage || 0);
                            const finalAmount = currentAmount -
                                (currentAmount * discountPercentage / 100);
                            return this.prisma.invoice.update({
                                where: { id: invoice.id },
                                data: { final_amount: finalAmount },
                            });
                        })
                    );
                    return { updatedStudent, updatedInvoices };
                }
            }
            return updatedStudent;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update student',
                error.message
            );
        }
    }

    async getStudentById(id: string) {
        const student = await this.prisma.student.findFirst({
            where: { user_id: id },
            include: {
                class_enrollments: {
                    include: {
                        class: {
                            include: {
                                class_teachers: {
                                    include: {
                                        teacher: true,
                                    },
                                },
                            },
                        },
                    },
                },
                 user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        username: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        return student;
    }

    async deleteStudent(id: string, user: User) {
        const student = await this.prisma.student.findFirst({
            where: { id },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        if (student.user_id !== user.id && user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete this student'
            );
        }

        try {
            await this.prisma.student.delete({
                where: { id },
            });
            return { message: 'Student deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete student',
                error.message
            );
        }
    }

    async getAllStudents() {
        const students = await this.prisma.student.findMany({
            include: {
                 user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        username: true,
                        role: true,
                        status: true,
                    },
                },
                class_enrollments: {
                    include: {
                        class: {
                            include: {
                                class_teachers: {
                                    include: {
                                        teacher: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (students.length === 0) {
            throw new NotFoundException('No students found');
        }
        return students;
    }
}
