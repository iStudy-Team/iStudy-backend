import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { User } from '@prisma/client';
import { AttendanceStatusEnum } from '../types/study.types';

@Injectable()
export class AttendanceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async create(createAttendanceDto: CreateAttendanceDto, user: User) {
        const { class_session_id, student_id } = createAttendanceDto;

        // Check if the class exists
        const classExists = await this.prisma.class_Session.findUnique({
            where: { id: class_session_id },
        });
        if (!classExists) {
            throw new NotFoundException(`Class not found`);
        }

        // Check if the student exists
        const studentExists = await this.prisma.student.findUnique({
            where: { id: student_id },
        });
        if (!studentExists) {
            throw new NotFoundException(`Student not found`);
        }

        // Check if the attendance record already exists for this class session and student
        const existingAttendance = await this.prisma.attendance.findFirst({
            where: {
                class_session_id,
                student_id,
            },
        });
        if (existingAttendance) {
            throw new InternalServerErrorException(
                `Attendance record already exists for this class session and student`
            );
        }

        try {
            const newAttendance = await this.prisma.attendance.create({
                data: {
                    ...createAttendanceDto,
                    id: this.generateIdService.generateId(),
                    recorded_by: user.id,
                    status:
                        createAttendanceDto.status ||
                        AttendanceStatusEnum.PRESENT,
                },
            });
            return newAttendance;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create attendance'
            );
        }
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        return this.prisma.attendance.findMany({
            include: {
                class_session: {
                    include: {
                        teacher: true,
                        class: {
                            select: { name: true, id: true },
                        },
                    },
                },
                student: {
                    select: { full_name: true, id: true },
                },
            },
            orderBy: { recorded_at: 'desc' }, // Order by recorded_at in descending order
            skip: skip,
            take: limit,
            distinct: ['class_session_id', 'student_id'], // Ensure unique attendance records per class session and student
            where: {
                class_session: {
                    status: {
                        not: 2, // Exclude completed classes
                    },
                },
                student: {
                    status: {
                        not: 2, // Exclude students with completed status
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { id },
            include: {
                class_session: {
                    include: {
                        teacher: true,
                        class: {
                            select: { name: true, id: true },
                        },
                    },
                },
                student: {
                    select: { full_name: true, id: true },
                },
            },
        });
        if (!attendance) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }
        return attendance;
    }

    async update(
        id: string,
        updateAttendanceDto: UpdateAttendanceDto,
        user: User
    ) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { id },
        });
        if (!attendance) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }

        try {
            const updatedAttendance = await this.prisma.attendance.update({
                where: { id },
                data: { ...updateAttendanceDto, recorded_by: user.id },
            });
            return updatedAttendance;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update attendance'
            );
        }
    }
}
