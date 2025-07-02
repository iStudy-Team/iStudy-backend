import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { User } from '@prisma/client';

@Injectable()
export class TeacherService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateId: GenerateIdService
    ) {}

    async createTeacher(createTeacherDto: CreateTeacherDto) {
        try {
            const existingTeacher = await this.prisma.teacher.findFirst({
                where: { user_id: createTeacherDto.user_id },
            });

            if (existingTeacher) {
                throw new ConflictException(
                    'A teacher with this user ID already exists'
                );
            }

            return await this.prisma.teacher.create({
                data: {
                    ...createTeacherDto,
                    id: this.generateId.generateId(),
                    status: createTeacherDto.status || 0,
                },
            });
        } catch (err) {
            console.error('Error creating teacher:', err);
            throw new InternalServerErrorException(
                err.message || 'Failed to create teacher'
            );
        }
    }

    async updateTeacher(
        reqUserId: string,
        id: string,
        updateTeacherDto: UpdateTeacherDto
    ) {
        try {
            const existingTeacher = await this.prisma.teacher.findUnique({
                where: { id },
            });

            if (!existingTeacher) {
                throw new NotFoundException(
                    'Teacher not found for the provided user ID'
                );
            }

            if (existingTeacher.user_id !== reqUserId) {
                throw new ForbiddenException(
                    'You do not have permission to update this teacher'
                );
            }

            return await this.prisma.teacher.update({
                where: { id: existingTeacher.id },
                data: {
                    ...updateTeacherDto,
                    status: updateTeacherDto.status || existingTeacher.status,
                },
            });
        } catch (err) {
            console.error('Error updating teacher:', err);
            throw new InternalServerErrorException(
                err.message || 'Failed to update teacher'
            );
        }
    }

    async getTeacherById(id: string) {
        try {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id },
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
                }
            });

            if (!teacher) {
                throw new NotFoundException(
                    'Teacher not found for the provided user ID'
                );
            }

            return teacher;
        } catch (err) {
            console.error('Error fetching teacher by ID:', err);
            throw new InternalServerErrorException(
                err.message || 'Failed to fetch teacher by ID'
            );
        }
    }

    async getAllTeachers() {
        try {
            return await this.prisma.teacher.findMany({
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
                },
            });
        } catch (err) {
            console.error('Error fetching all teachers:', err);
            throw new InternalServerErrorException(
                err.message || 'Failed to fetch all teachers'
            );
        }
    }

    async deleteTeacher(id: string, user: User) {
        try {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id },
            });

            if (!teacher) {
                throw new NotFoundException(
                    'Teacher not found for the provided ID'
                );
            }

            if (teacher.user_id !== user.id && user.role !== 4) {
                throw new ForbiddenException(
                    'You do not have permission to delete this teacher'
                );
            }

            return await this.prisma.teacher.delete({
                where: { id: teacher.id },
            });
        } catch (err) {
            console.error('Error deleting teacher:', err);
            throw new InternalServerErrorException(
                err.message || 'Failed to delete teacher'
            );
        }
    }
}
