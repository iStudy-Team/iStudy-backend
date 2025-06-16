import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { SearchClasssDto } from './dto/search-class.dto';
import { User } from '@prisma/client';
import { ClassTeacherService } from '../class-teacher/class-teacher.service';

@Injectable()
export class ClassService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService,
        private readonly classTeacherService: ClassTeacherService
    ) {}

    async createClass(user: User, createClassDto: CreateClassDto) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create a class'
            );
        }

        if (createClassDto.start_date && createClassDto.end_date) {
            if (
                new Date(createClassDto.start_date) >
                new Date(createClassDto.end_date)
            ) {
                throw new ConflictException(
                    'Start date cannot be after end date'
                );
            }
        }

        const existingClass = await this.prisma.class.findFirst({
            where: {
                name: createClassDto.name,
                academic_year_id: createClassDto.academic_year_id,
                grade_level_id: createClassDto.grade_level_id,
            },
        });

        if (existingClass) {
            throw new ConflictException(
                'Class with the same name already exists for this academic year and grade level'
            );
        }

        if (createClassDto.teacher_id) {
            const teacherExists = await this.prisma.teacher.findUnique({
                where: { id: createClassDto.teacher_id },
            });
            if (!teacherExists) {
                throw new NotFoundException('Teacher not found');
            }
        }

        try {
            const newClass = await this.prisma.class.create({
                data: {
                    id: this.generateIdService.generateId(),
                    ...createClassDto,
                },
            });

            if (createClassDto.teacher_id) {
                await this.classTeacherService.create(
                    {
                        class_id: newClass.id,
                        teacher_id: createClassDto.teacher_id,
                        role: 0,
                    },
                    user
                );
            }

            return newClass;
        } catch (error) {
            console.error('Error creating class:', error);
            throw new InternalServerErrorException(
                'An error occurred while creating the class'
            );
        }
    }

    async updateClass(
        user: User,
        classId: string,
        updateClassDto: UpdateClassDto
    ) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update a class'
            );
        }

        const existingClass = await this.prisma.class.findUnique({
            where: { id: classId },
        });

        if (!existingClass) {
            throw new NotFoundException('Class not found');
        }

        if (
            existingClass.academic_year_id !==
                updateClassDto.academic_year_id ||
            existingClass.grade_level_id !== updateClassDto.grade_level_id ||
            existingClass.name !== updateClassDto.name
        ) {
            const classWithSameDetails = await this.prisma.class.findFirst({
                where: {
                    name: updateClassDto.name,
                    academic_year_id: updateClassDto.academic_year_id,
                    grade_level_id: updateClassDto.grade_level_id,
                },
            });
            if (classWithSameDetails) {
                throw new ConflictException(
                    'Class with the same name already exists for this academic year and grade level'
                );
            }
        }

        if (updateClassDto.start_date && updateClassDto.end_date) {
            if (
                new Date(updateClassDto.start_date) >
                new Date(updateClassDto.end_date)
            ) {
                throw new ConflictException(
                    'Start date cannot be after end date'
                );
            }
        }

        try {
            const updatedClass = await this.prisma.class.update({
                where: { id: classId },
                data: updateClassDto,
            });

            return updatedClass;
        } catch (error) {
            console.error('Error updating class:', error);
            throw new InternalServerErrorException(
                'An error occurred while updating the class'
            );
        }
    }

    async searchClasses(searchTerm: string, dto: SearchClasssDto) {
        const skip = (dto.page || 1 - 1) * (dto.limit || 10);

        try {
            const classes = await this.prisma.class.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                            },
                        },
                        { status: { equals: parseInt(searchTerm) } },
                    ],
                },
                include: {
                    academic_year: true,
                    grade_level: true,
                    schedule: true,
                    class_teachers: {
                        include: {
                            teacher: {
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
                skip,
                take: dto.limit || 10,
                orderBy: {
                    created_at: 'desc',
                },
            });

            return classes;
        } catch (error) {
            console.error('Error searching classes:', error);
            throw new InternalServerErrorException(
                'An error occurred while searching for classes'
            );
        }
    }

    async getClassById(classId: string) {
        const classDetails = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                academic_year: true,
                grade_level: true,
                schedule: true,
                class_teachers: {
                    include: {
                        teacher: {
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
        });

        if (!classDetails) {
            throw new NotFoundException('Class not found');
        }

        return classDetails;
    }

    async deleteClass(user: User, classId: string) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete a class'
            );
        }

        const existingClass = await this.prisma.class.findUnique({
            where: { id: classId },
        });

        if (!existingClass) {
            throw new NotFoundException('Class not found');
        }

        try {
            await this.prisma.class.delete({
                where: { id: classId },
            });
            return { message: 'Class deleted successfully' };
        } catch (error) {
            console.error('Error deleting class:', error);
            throw new InternalServerErrorException(
                'An error occurred while deleting the class'
            );
        }
    }

    async getAllClasses() {
        try {
            const classes = await this.prisma.class.findMany({
                include: {
                    academic_year: true,
                    grade_level: true,
                    schedule: true,
                    class_teachers: {
                        include: {
                            teacher: true,
                        },
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            return classes;
        } catch (error) {
            console.error('Error fetching all classes:', error);
            throw new InternalServerErrorException(
                'An error occurred while fetching all classes'
            );
        }
    }

    async getPagination(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const totalClasses = await this.prisma.class.count();
        const totalPages = Math.ceil(totalClasses / limit);

        const classes = await this.prisma.class.findMany({
            skip,
            take: limit,
            include: {
                academic_year: true,
                grade_level: true,
                schedule: true,
                class_teachers: {
                    include: {
                        teacher: {
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
            orderBy: {
                created_at: 'desc',
            },
        });

        return {
            classes,
            totalClasses,
            totalPages,
            currentPage: page,
        };
    }
}
