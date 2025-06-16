import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { CreateClassTeacherDto } from './dto/create-class-teacher.dto';
import { UpdateClassTeacherDto } from './dto/update-class-teacher.dto';
import { User } from '@prisma/client';
import { ClassTeacherStatusEnum } from '../types/study.types';

@Injectable()
export class ClassTeacherService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async create(createClassTeacherDto: CreateClassTeacherDto, user: User) {
        const { class_id, teacher_id } = createClassTeacherDto;

        // Check if the class exists
        const classExists = await this.prisma.class.findUnique({
            where: { id: class_id },
        });
        if (!classExists) {
            throw new NotFoundException(`Class not found`);
        }

        // Check if the teacher exists
        const teacherExists = await this.prisma.teacher.findUnique({
            where: { id: teacher_id },
        });
        if (!teacherExists) {
            throw new NotFoundException(`Teacher not found`);
        }

        // Check if the user has permission to create a class teacher
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create a class teacher'
            );
        }

        try {
            const newClassTeacher = await this.prisma.class_Teacher.create({
                data: {
                    ...createClassTeacherDto,
                    id: this.generateIdService.generateId(),
                    status: createClassTeacherDto.status || 0,
                },
            });
            return newClassTeacher;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create class teacher'
            );
        }
    }

    async update(dto: UpdateClassTeacherDto, user: User, id: string) {
        const { class_id, teacher_id } = dto;

        // Check if the class exists
        const classExists = await this.prisma.class.findUnique({
            where: { id: class_id },
        });
        if (!classExists) {
            throw new NotFoundException(`Class not found`);
        }

        // Check if the teacher exists
        const teacherExists = await this.prisma.teacher.findUnique({
            where: { id: teacher_id },
        });
        if (!teacherExists) {
            throw new NotFoundException(`Teacher not found`);
        }

        // Check if the user has permission to update a class teacher
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update a class teacher'
            );
        }

        try {
            const updatedClassTeacher = await this.prisma.class_Teacher.update({
                where: { id: id },
                data: dto,
            });
            return updatedClassTeacher;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update class teacher'
            );
        }
    }

    async delete(id: string, user: User) {
        // Check if the class teacher exists
        const classTeacherExists = await this.prisma.class_Teacher.findUnique({
            where: { id: id },
        });
        if (!classTeacherExists) {
            throw new NotFoundException(`Class teacher not found`);
        }

        // Check if the user has permission to delete a class teacher
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete a class teacher'
            );
        }

        try {
            await this.prisma.class_Teacher.delete({
                where: { id: id },
            });
            return { message: 'Class teacher deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete class teacher'
            );
        }
    }

    async findAll() {
        try {
            const classTeachers = await this.prisma.class_Teacher.findMany({
                include: {
                    class: true,
                    teacher: true,
                },
            });
            return classTeachers;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to retrieve class teachers'
            );
        }
    }

    async findOne(id: string) {
        // Check if the class teacher exists
        const classTeacher = await this.prisma.class_Teacher.findUnique({
            where: { id: id },
            include: {
                class: true,
                teacher: true,
            },
        });
        if (!classTeacher) {
            throw new NotFoundException(`Class teacher not found`);
        }
        return classTeacher;
    }

    async getByTeacherId(teacher_id: string) {
        // Check if the teacher exists
        const teacherExists = await this.prisma.teacher.findUnique({
            where: { id: teacher_id },
        });
        if (!teacherExists) {
            throw new NotFoundException(`Not found teacher `);
        }

        try {
            const classTeachers = await this.prisma.class_Teacher.findMany({
                where: {
                    teacher_id: teacher_id,
                    status: ClassTeacherStatusEnum.ACTIVE,
                },
                include: {
                    class: true,
                    teacher: true,
                },
            });
            return classTeachers;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to retrieve class teachers for the specified teacher'
            );
        }
    }
}
