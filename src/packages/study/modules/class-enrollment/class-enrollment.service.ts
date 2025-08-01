import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { User } from '@prisma/client';
import { ClassEnrollmentStatusEnum } from '../types/study.types';
import { CreateClassEnrollmentDto } from './dto/create-class-enrollment.dto';
import { UpdateClassEnrollmentDto } from './dto/update-class-enrollment.dto';

@Injectable()
export class ClassEnrollmentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async create(
        createClassEnrollmentDto: CreateClassEnrollmentDto,
        user: User
    ) {
        const { class_id } = createClassEnrollmentDto;
        // Check if the class exists
        const classExists = await this.prisma.class.findUnique({
            where: { id: class_id },
        });
        if (!classExists) {
            throw new NotFoundException(`Class not found`);
        }
        // Check if the student exists
        const studentExists = await this.prisma.student.findUnique({
            where: { id: user.id },
        });
        if (!studentExists) {
            throw new NotFoundException(`Student not found`);
        }
        // Check if the user is already enrolled in the class
        const existingEnrollment = await this.prisma.class_Enrollment.findFirst(
            {
                where: {
                    class_id,
                    student_id: user.id,
                },
            }
        );
        if (existingEnrollment) {
            throw new ForbiddenException(
                `You are already enrolled in this class`
            );
        }
        // Check if the user has permission to create a class enrollment
        try {
            const newClassEnrollment =
                await this.prisma.class_Enrollment.create({
                    data: {
                        ...createClassEnrollmentDto,
                        id: this.generateIdService.generateId(),
                        student_id: user.id,
                        enrollment_date: new Date().toISOString(),
                    },
                });
            return newClassEnrollment;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create class enrollment'
            );
        }
    }

    async update(
        id: string,
        updateClassEnrollmentDto: UpdateClassEnrollmentDto,
        user: User
    ) {
        // Check if the class enrollment exists
        const classEnrollment = await this.prisma.class_Enrollment.findUnique({
            where: { id },
        });
        if (!classEnrollment) {
            throw new NotFoundException(`Class enrollment not found`);
        }
        // Check if the user has permission to update the class enrollment
        if (classEnrollment.student_id !== user.id) {
            throw new ForbiddenException(
                `You do not have permission to update this class enrollment`
            );
        }
        // Update the class enrollment
        try {
            const updatedClassEnrollment =
                await this.prisma.class_Enrollment.update({
                    where: { id },
                    data: {
                        ...updateClassEnrollmentDto,
                    },
                });
            return updatedClassEnrollment;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update class enrollment'
            );
        }
    }

    async finClassesByUserId(userId: string, page?: number, limit?: number) {
        // Check if the user exists
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!userExists) {
            throw new NotFoundException(`User not found`);
        }
        // Fetch class enrollments
        const classEnrollments = await this.prisma.class_Enrollment.findMany({
            where: { student_id: userId },
            include: {
                class: {
                    include: {
                        class_teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        full_name: true,
                                    },
                                },
                            },
                        },
                        class_enrollments: {
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        full_name: true,
                                    },
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                email: true,
                                                phone: true,
                                                avatar: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            skip: (page || 1 - 1) * (limit || 10),
            take: limit,
        });
        if (!classEnrollments || classEnrollments.length === 0) {
            throw new NotFoundException(`No class enrollments found for user`);
        }
        return classEnrollments.map((enrollment) => ({
            ...enrollment,
            status: ClassEnrollmentStatusEnum[enrollment.status],
        }));
    }

    async findById(id: string) {
        // Check if the class enrollment exists
        const classEnrollment = await this.prisma.class_Enrollment.findUnique({
            where: { id },
            include: {
                class: {
                    include: {
                        class_teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        full_name: true,
                                    },
                                },
                            },
                        },
                        class_enrollments: {
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        full_name: true,
                                    },
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                email: true,
                                                phone: true,
                                                avatar: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!classEnrollment) {
            throw new NotFoundException(`Class enrollment not found`);
        }
        return classEnrollment;
    }
}
