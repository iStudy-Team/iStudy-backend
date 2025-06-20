import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { User } from '@prisma/client';

@Injectable()
export class ClassSessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async create(createClassSessionDto: CreateClassSessionDto, user: User) {
        const { class_id } = createClassSessionDto;

        // Check if the class exists
        const classExists = await this.prisma.class.findUnique({
            where: { id: class_id },
        });
        if (!classExists) {
            throw new NotFoundException(`Class not found`);
        }

        if (user.role !== 4) {
            throw new NotFoundException(
                `You are not authorized to create class sessions`
            );
        }

        try {
            return this.prisma.class_Session.create({
                data: {
                    ...createClassSessionDto,
                    id: this.generateIdService.generateId(),
                    date: createClassSessionDto.date
                        ? new Date(createClassSessionDto.date)
                        : new Date(),
                    start_time: createClassSessionDto.start_time
                        ? new Date(createClassSessionDto.start_time)
                        : new Date(),
                    end_time: createClassSessionDto.end_time
                        ? new Date(createClassSessionDto.end_time)
                        : new Date(),
                },
            });
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to create class session`
            );
        }
    }

    async findAll() {
        return this.prisma.class_Session.findMany({
            orderBy: {
                date: 'desc',
            },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                    include: {
                        class_enrollments: {
                            include: {
                                student: true,
                            },
                        },
                    },
                },
                attendances: {
                    include: {
                        student: {
                            select: {
                                full_name: true,
                                id: true,
                            },
                        },
                    },
                },
                teacher: true,
            },
        });
    }

    async findOne(id: string) {
        const classSession = await this.prisma.class_Session.findUnique({
            where: { id },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                    include: {
                        class_enrollments: {
                            include: {
                                student: true,
                            },
                        },
                    },
                },
                teacher: true,
                attendances: {
                    include: {
                        student: {
                            select: {
                                full_name: true,
                                id: true,
                            },
                        },
                    },
                },
            },
        });
        if (!classSession) {
            throw new NotFoundException(`Class session not found`);
        }
        return classSession;
    }

    async update(
        id: string,
        updateClassSessionDto: UpdateClassSessionDto,
        user: User
    ) {
        const classSession = await this.prisma.class_Session.findUnique({
            where: { id },
        });
        if (!classSession) {
            throw new NotFoundException(`Class session not found`);
        }

        if (user.role !== 4) {
            throw new NotFoundException(
                `You are not authorized to update class sessions`
            );
        }

        try {
            return this.prisma.class_Session.update({
                where: { id },
                data: updateClassSessionDto,
            });
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to update class session`
            );
        }
    }

    async remove(id: string, user: User) {
        const classSession = await this.prisma.class_Session.findUnique({
            where: { id },
        });
        if (!classSession) {
            throw new NotFoundException(`Class session not found`);
        }

        if (user.role !== 4) {
            throw new NotFoundException(
                `You are not authorized to delete class sessions`
            );
        }

        try {
            return this.prisma.class_Session.delete({
                where: { id },
            });
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to delete class session`
            );
        }
    }
}
