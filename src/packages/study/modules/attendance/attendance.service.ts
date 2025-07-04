import { PrismaService } from 'src/prisma/prisma.service';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    ForbiddenException,
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

        const teacherExit = await this.prisma.teacher.findFirst({
            where: {
                user_id: user.id,
            },
        });

        if (!teacherExit) {
            throw new ForbiddenException(
                `You are not authorized to create attendance records`
            );
        }

        try {
            const newAttendance = await this.prisma.attendance.create({
                data: {
                    ...createAttendanceDto,
                    id: this.generateIdService.generateId(),
                    recorded_by: teacherExit.id,
                    status:
                        createAttendanceDto.status ||
                        AttendanceStatusEnum.PRESENT,
                },
            });
            return newAttendance;
        } catch (error) {
            console.error('Error creating attendance:', error);
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
                student: true
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

        const teacherExit = await this.prisma.teacher.findFirst({
            where: {
                user_id: user.id,
            },
        });

        if (!teacherExit) {
            throw new ForbiddenException(
                `You are not authorized to update attendance records`
            );
        }

        try {
            const updatedAttendance = await this.prisma.attendance.update({
                where: { id },
                data: {
                    ...updateAttendanceDto,
                    recorded_by: teacherExit.id,
                    recorded_at: new Date(),
                },
            });
            return updatedAttendance;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update attendance'
            );
        }
    }

    async createBulkAttendance(
        classSessionId: string,
        attendanceRecords: Array<{
            student_id: string;
            status: number;
            comment?: string;
        }>,
        user: User
    ) {
        // Check if the class session exists
        const classSessionExists = await this.prisma.class_Session.findUnique({
            where: { id: classSessionId },
        });
        if (!classSessionExists) {
            throw new NotFoundException(`Class session not found`);
        }

        const createdAttendances: any[] = [];
        const errors: any[] = [];

        for (const record of attendanceRecords) {
            try {
                // Check if attendance already exists for this student and session
                const existingAttendance =
                    await this.prisma.attendance.findFirst({
                        where: {
                            class_session_id: classSessionId,
                            student_id: record.student_id,
                        },
                    });

                if (existingAttendance) {
                    // Update existing attendance
                    const updatedAttendance =
                        await this.prisma.attendance.update({
                            where: { id: existingAttendance.id },
                            data: {
                                status: record.status,
                                comment: record.comment,
                                recorded_by: user.id,
                                recorded_at: new Date(),
                            },
                        });
                    createdAttendances.push(updatedAttendance);
                } else {
                    // Create new attendance
                    const newAttendance = await this.prisma.attendance.create({
                        data: {
                            id: this.generateIdService.generateId(),
                            class_session_id: classSessionId,
                            student_id: record.student_id,
                            status: record.status,
                            comment: record.comment,
                            recorded_by: user.id,
                            recorded_at: new Date(),
                        },
                    });
                    createdAttendances.push(newAttendance);
                }
            } catch (error) {
                errors.push({
                    student_id: record.student_id,
                    error: (error as Error).message,
                });
            }
        }

        return {
            success: createdAttendances,
            errors,
        };
    }

    async findByClassSession(classSessionId: string) {
        const classSession = await this.prisma.class_Session.findUnique({
            where: { id: classSessionId },
        });
        if (!classSession) {
            throw new NotFoundException(`Class session not found`);
        }

        return this.prisma.attendance.findMany({
            where: { class_session_id: classSessionId },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        user: {
                            select: {
                                email: true,
                                phone: true,
                                avatar: true,
                            },
                        },
                    },
                },
                class_session: {
                    include: {
                        class: {
                            select: { name: true, id: true },
                        },
                    },
                },
            },
            orderBy: { recorded_at: 'desc' },
        });
    }

    async getAttendanceStats(filters: {
        classId?: string;
        studentId?: string;
        dateFrom?: string;
        dateTo?: string;
    }) {
        const where: any = {};

        if (filters.classId) {
            where.class_session = {
                class_id: filters.classId,
            };
        }

        if (filters.studentId) {
            where.student_id = filters.studentId;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.class_session = {
                ...where.class_session,
                date: {},
            };

            if (filters.dateFrom) {
                where.class_session.date.gte = new Date(filters.dateFrom);
            }

            if (filters.dateTo) {
                where.class_session.date.lte = new Date(filters.dateTo);
            }
        }

        const attendanceRecords = await this.prisma.attendance.findMany({
            where,
            include: {
                class_session: true,
            },
        });

        const totalSessions = attendanceRecords.length;
        const present = attendanceRecords.filter((a) => a.status === 1).length; // Assuming 1 = PRESENT
        const absent = attendanceRecords.filter((a) => a.status === 0).length; // Assuming 0 = ABSENT
        const late = attendanceRecords.filter((a) => a.status === 2).length; // Assuming 2 = LATE
        const excused = attendanceRecords.filter((a) => a.status === 3).length; // Assuming 3 = EXCUSED

        const attendanceRate =
            totalSessions > 0 ? (present / totalSessions) * 100 : 0;

        return {
            totalSessions,
            present,
            absent,
            late,
            excused,
            attendanceRate,
        };
    }
}
