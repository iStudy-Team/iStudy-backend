import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { GetScheduleByMultipleClassDto } from './dto/get-schedule-by-multiple-class.dto';
import { ClassSessionService } from '../class-session/class-session.service';

@Injectable()
export class ScheduleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService,
        private readonly classSessionService: ClassSessionService
    ) {}

    async createSchedule(user: User, createScheduleDto: CreateScheduleDto) {
        const { class_id, day, start_time, end_time } = createScheduleDto;

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create a schedule'
            );
        }

        // Validate required fields
        if (!day || !start_time || !end_time) {
            throw new ConflictException(
                'Day, start_time, and end_time are required'
            );
        }

        // Parse and validate time format
        const startTime = new Date(start_time);
        const endTime = new Date(end_time);
        const scheduleDay = new Date(day);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || isNaN(scheduleDay.getTime())) {
            throw new ConflictException(
                'Invalid date/time format. Please use ISO string format'
            );
        }

        if (startTime >= endTime) {
            throw new ConflictException(
                'Start time must be before end time'
            );
        }

        // Check if the class exists and belongs to the user's school
        const classExists = await this.prisma.class.findFirst({
            where: {
                id: class_id,
            },
            include: {
                class_teachers: {
                    include: {
                        teacher: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        if (!classExists) {
            throw new NotFoundException('Class not found');
        }

        // Check for time overlaps with existing schedules for the same class
        const hasOverlap = await this.checkScheduleOverlaps(class_id, startTime, endTime);

        if (hasOverlap) {
            throw new ConflictException(
                'Schedule time overlaps with existing schedule for this class'
            );
        }

        try {
            const teacherId = classExists.class_teachers.find(
                (ct) => ct.role === 0
            )?.teacher.id;

            if (!teacherId) {
                throw new NotFoundException(
                    'Main teacher not found for the class'
                );
            }

            // Create the schedule first
            const newSchedule = await this.prisma.schedule.create({
                data: {
                    id: this.generateIdService.generateId(),
                    class_id,
                    day: scheduleDay,
                    start_time: startTime,
                    end_time: endTime,
                },
            });

            // Create corresponding class session
            await this.classSessionService.create(
                {
                    class_id,
                    date: day,
                    start_time,
                    end_time,
                    teacher_id: teacherId,
                    topic: 'Session for ' + classExists.name,
                },
                user
            );

            return newSchedule;
        } catch (error) {
            console.error('Error creating schedule:', error);
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create schedule');
        }
    }

    async updateSchedule(
        user: User,
        scheduleId: string,
        updateScheduleDto: UpdateScheduleDto
    ) {
        const { class_id, day, start_time, end_time } = updateScheduleDto;

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update a schedule'
            );
        }

        // Check if the schedule exists
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        // Validate time format if provided
        if (start_time && end_time) {
            const startTime = new Date(start_time);
            const endTime = new Date(end_time);

            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                throw new ConflictException(
                    'Invalid date/time format. Please use ISO string format'
                );
            }

            if (startTime >= endTime) {
                throw new ConflictException(
                    'Start time must be before end time'
                );
            }
        }

        // Check if the class exists and belongs to the user's school
        if (class_id) {
            const classExists = await this.prisma.class.findFirst({
                where: {
                    id: class_id,
                },
            });

            if (!classExists) {
                throw new NotFoundException('Class not found');
            }

            // Check for time overlaps if updating time
            if (start_time && end_time) {
                const startTime = new Date(start_time);
                const endTime = new Date(end_time);

                const hasOverlap = await this.checkScheduleOverlaps(
                    class_id,
                    startTime,
                    endTime,
                    scheduleId
                );

                if (hasOverlap) {
                    throw new ConflictException(
                        'Schedule time overlaps with existing schedule for this class'
                    );
                }
            }
        }

        // Prepare update data
        const updateData: any = {};
        if (class_id) updateData.class_id = class_id;
        if (day) updateData.day = new Date(day);
        if (start_time) updateData.start_time = new Date(start_time);
        if (end_time) updateData.end_time = new Date(end_time);

        // Update the schedule
        try {
            return await this.prisma.schedule.update({
                where: { id: scheduleId },
                data: updateData,
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to update schedule');
        }
    }

    async getScheduleById(id: string) {
        // Check if the schedule exists
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
        });

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        return schedule;
    }

    async getSchedules(getScheduleDto: GetScheduleDto) {
        if (getScheduleDto.class_id && !getScheduleDto.day) {
            const schedules = await this.prisma.schedule.findMany({
                where: {
                    class_id: getScheduleDto.class_id,
                },
                orderBy: [
                    { day: 'asc' },
                    { start_time: 'asc' },
                ],
            });
            return schedules;
        } else if (getScheduleDto.day && !getScheduleDto.class_id) {
            const schedules = await this.prisma.schedule.findMany({
                where: {
                    day: getScheduleDto.day,
                },
                include: {
                    class: {
                        include: {
                            class_sessions: {
                                select: {
                                    topic: true,
                                    start_time: true,
                                    end_time: true,
                                    date: true,
                                    teacher: {
                                        select: {
                                            id: true,
                                            full_name: true,
                                        },
                                    },
                                }
                            },
                            class_teachers: {
                                include: {
                                    teacher: true,
                                },
                            },
                        }
                    },
                },
                orderBy: {
                    start_time: 'asc',
                },
            });
            return schedules;
        } else if (getScheduleDto.class_id && getScheduleDto.day) {
            const schedules = await this.prisma.schedule.findMany({
                where: {
                    class_id: getScheduleDto.class_id,
                    day: getScheduleDto.day,
                },
                orderBy: {
                    start_time: 'asc',
                },
            });
            return schedules;
        }
    }

    async getSchedulesByMultipleClasses(
        getScheduleByMultipleClassDto: GetScheduleByMultipleClassDto
    ) {
        const { class_ids } = getScheduleByMultipleClassDto;
        if (!class_ids || class_ids.length === 0) {
            throw new ConflictException('At least one class ID is required');
        }
        const schedules = await this.prisma.schedule.findMany({
            where: {
                class_id: {
                    in: class_ids,
                },
            },
            include: {
                class: {
                    include: {
                        class_teachers: {
                            include: {
                                teacher: true
                            }
                        },
                        class_sessions: {
                            select: {
                                topic: true,
                                start_time: true,
                                end_time: true,
                                date: true,
                                teacher: {
                                    select: {
                                        id: true,
                                        full_name: true,
                                    },
                                },
                            },
                        },
                    }
                }
            },
            orderBy: [
                { day: 'asc' },
                { start_time: 'asc' },
            ],
        });
        if (schedules.length === 0) {
            throw new NotFoundException(
                'No schedules found for the provided class IDs'
            );
        }
        return schedules;
    }

    async getScheduleByStudentId(userId: string) {
        // Check if the student exists
        const student = await this.prisma.student.findMany({
            where: { user_id: userId },
            include: {
                class_enrollments: {
                    include: {
                        class: {
                            include: {
                                schedule: true,
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

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Extract schedules from class enrollments
        const schedules = student.class_enrollments.flatMap(
            (enrollment) =>
            enrollment.class.schedule.map((schedule) => ({
                ...schedule,
                class_name: enrollment.class.name,
                teacher: enrollment.class.class_teachers.map((ct => ({
                    id: ct.teacher.id,
                    full_name: ct.teacher.full_name,
                }))),
            }))
        );

        if (schedules.length === 0) {
            throw new NotFoundException('No schedules found for the student');
        }

        return schedules;
    }

    async getSchedulesByTeacherId(teacherId: string) {
        // Check if the teacher exists

        const teacher = await this.prisma.teacher.findFirst({
            where: { user_id: teacherId },
        });

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        const class_teachers = await this.prisma.class_Teacher.findMany({
            where: { teacher_id: teacher.id },
            select: { class_id: true },
        });

        if (!class_teachers || class_teachers.length === 0) {
            throw new NotFoundException('Teacher not found or has no classes');
        }

        // Extract all class_ids from the array of class_teachers
        const class_ids = class_teachers.map(ct => ct.class_id);

        const schedules = await this.prisma.schedule.findMany({
            where: {
                class_id: {
                    in: class_ids
                },
            },
            include: {
                class: {
                    include: {
                        class_teachers: {
                            include: {
                                teacher: true,
                            },
                        },
                        class_sessions: {
                            select: {
                                topic: true,
                                start_time: true,
                                end_time: true,
                                date: true,
                                teacher: {
                                    select: {
                                        id: true,
                                        full_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { day: 'asc' },
                { start_time: 'asc' },
            ],
        });
        if (schedules.length === 0) {
            throw new NotFoundException('No schedules found for the teacher');
        }
        return schedules;
    }

    /**
     * Helper method to check if two time ranges overlap
     */
    private doTimeRangesOverlap(
        start1: Date,
        end1: Date,
        start2: Date,
        end2: Date
    ): boolean {
        return start1 < end2 && end1 > start2;
    }

    /**
     * Helper method to check for schedule overlaps for a specific class
     */
    private async checkScheduleOverlaps(
        classId: string,
        startTime: Date,
        endTime: Date,
        excludeScheduleId?: string
    ): Promise<boolean> {
        const existingSchedules = await this.prisma.schedule.findMany({
            where: {
                class_id: classId,
                ...(excludeScheduleId && {
                    id: {
                        not: excludeScheduleId,
                    },
                }),
            },
        });

        return existingSchedules.some(schedule => {
            if (!schedule.start_time || !schedule.end_time) {
                return false;
            }

            const existingStart = new Date(schedule.start_time);
            const existingEnd = new Date(schedule.end_time);

            return this.doTimeRangesOverlap(startTime, endTime, existingStart, existingEnd);
        });
    }

    /**
     * Create multiple schedules for a class with overlap validation
     */
    async createMultipleSchedules(
        user: User,
        schedules: CreateScheduleDto[]
    ) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create schedules'
            );
        }

        // Validate all schedules first
        for (let i = 0; i < schedules.length; i++) {
            const schedule = schedules[i];
            if (!schedule.day || !schedule.start_time || !schedule.end_time) {
                throw new ConflictException(
                    `Schedule ${i + 1}: Day, start_time, and end_time are required`
                );
            }

            const startTime = new Date(schedule.start_time);
            const endTime = new Date(schedule.end_time);

            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                throw new ConflictException(
                    `Schedule ${i + 1}: Invalid date/time format`
                );
            }

            if (startTime >= endTime) {
                throw new ConflictException(
                    `Schedule ${i + 1}: Start time must be before end time`
                );
            }
        }

        // Check for overlaps within the new schedules
        for (let i = 0; i < schedules.length; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                const schedule1 = schedules[i];
                const schedule2 = schedules[j];

                if (schedule1.class_id === schedule2.class_id) {
                    const start1 = new Date(schedule1.start_time!);
                    const end1 = new Date(schedule1.end_time!);
                    const start2 = new Date(schedule2.start_time!);
                    const end2 = new Date(schedule2.end_time!);

                    if (this.doTimeRangesOverlap(start1, end1, start2, end2)) {
                        throw new ConflictException(
                            `Schedules ${i + 1} and ${j + 1} overlap for the same class`
                        );
                    }
                }
            }
        }

        // Create schedules one by one
        const createdSchedules: any[] = [];
        for (const scheduleDto of schedules) {
            try {
                const schedule = await this.createSchedule(user, scheduleDto);
                createdSchedules.push(schedule);
            } catch (error) {
                // If any schedule fails, you might want to implement a rollback strategy
                console.error('Failed to create schedule:', error);
                throw error;
            }
        }

        return createdSchedules;
    }

    async deleteSchedule(user: User, scheduleId: string) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete a schedule'
            );
        }

        // Check if the schedule exists
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        try {
            // Check if there are any related class sessions that need to be handled
            const relatedSessions = await this.prisma.class_Session.findMany({
                where: {
                    class_id: schedule.class_id,
                    ...(schedule.day && { date: schedule.day }),
                    ...(schedule.start_time && { start_time: schedule.start_time }),
                    ...(schedule.end_time && { end_time: schedule.end_time }),
                },
            });

            // Delete the schedule
            const deletedSchedule = await this.prisma.schedule.delete({
                where: { id: scheduleId },
            });

            // Optionally, you might want to delete or update related class sessions
            // For now, we'll just log them but you can decide the business logic
            if (relatedSessions.length > 0) {
                console.log(`Found ${relatedSessions.length} related class sessions for deleted schedule. Consider handling them based on business requirements.`);
                // Uncomment the following if you want to delete related sessions automatically:
                // await this.prisma.class_Session.deleteMany({
                //     where: {
                //         id: { in: relatedSessions.map(session => session.id) }
                //     }
                // });
            }

            return {
                success: true,
                message: `Schedule for class "${schedule.class.name}" has been deleted successfully`,
                deletedSchedule,
            };
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw new InternalServerErrorException('Failed to delete schedule');
        }
    }

    async deleteScheduleAndSessions(user: User, scheduleId: string) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete a schedule'
            );
        }

        // Check if the schedule exists
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        try {
            // Find related class sessions
            const relatedSessions = await this.prisma.class_Session.findMany({
                where: {
                    class_id: schedule.class_id,
                    ...(schedule.day && { date: schedule.day }),
                    ...(schedule.start_time && { start_time: schedule.start_time }),
                    ...(schedule.end_time && { end_time: schedule.end_time }),
                },
                select: {
                    id: true,
                    topic: true,
                },
            });

            // Use transaction to ensure data consistency
            const result = await this.prisma.$transaction(async (prisma) => {
                // Delete related class sessions first
                if (relatedSessions.length > 0) {
                    await prisma.class_Session.deleteMany({
                        where: {
                            id: { in: relatedSessions.map(session => session.id) }
                        }
                    });
                }

                // Delete the schedule
                const deletedSchedule = await prisma.schedule.delete({
                    where: { id: scheduleId },
                });

                return {
                    deletedSchedule,
                    deletedSessionsCount: relatedSessions.length,
                    deletedSessions: relatedSessions,
                };
            });

            return {
                success: true,
                message: `Schedule for class "${schedule.class.name}" and ${result.deletedSessionsCount} related session(s) have been deleted successfully`,
                ...result,
            };
        } catch (error) {
            console.error('Error deleting schedule and sessions:', error);
            throw new InternalServerErrorException('Failed to delete schedule and related sessions');
        }
    }

    async deleteMultipleSchedules(user: User, scheduleIds: string[]) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete schedules'
            );
        }

        if (!scheduleIds || scheduleIds.length === 0) {
            throw new ConflictException('At least one schedule ID is required');
        }

        // Check if all schedules exist
        const schedules = await this.prisma.schedule.findMany({
            where: {
                id: { in: scheduleIds },
            },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        const foundIds = schedules.map(s => s.id);
        const notFoundIds = scheduleIds.filter(id => !foundIds.includes(id));

        if (notFoundIds.length > 0) {
            throw new NotFoundException(
                `Schedules not found: ${notFoundIds.join(', ')}`
            );
        }

        try {
            const result = await this.prisma.$transaction(async (prisma) => {
                const deletedSchedules: Array<{
                    id: string;
                    className: string;
                    deletedSessionsCount: number;
                }> = [];
                let totalDeletedSessions = 0;

                for (const schedule of schedules) {
                    // Find related class sessions for each schedule
                    const relatedSessions = await prisma.class_Session.findMany({
                        where: {
                            class_id: schedule.class_id,
                            ...(schedule.day && { date: schedule.day }),
                            ...(schedule.start_time && { start_time: schedule.start_time }),
                            ...(schedule.end_time && { end_time: schedule.end_time }),
                        },
                        select: { id: true },
                    });

                    // Delete related sessions
                    if (relatedSessions.length > 0) {
                        await prisma.class_Session.deleteMany({
                            where: {
                                id: { in: relatedSessions.map(session => session.id) }
                            }
                        });
                        totalDeletedSessions += relatedSessions.length;
                    }

                    deletedSchedules.push({
                        id: schedule.id,
                        className: schedule.class.name,
                        deletedSessionsCount: relatedSessions.length,
                    });
                }

                // Delete all schedules
                await prisma.schedule.deleteMany({
                    where: {
                        id: { in: scheduleIds },
                    },
                });

                return {
                    deletedSchedules,
                    totalDeletedSessions,
                };
            });

            return {
                success: true,
                message: `Successfully deleted ${schedules.length} schedule(s) and ${result.totalDeletedSessions} related session(s)`,
                deletedCount: schedules.length,
                ...result,
            };
        } catch (error) {
            console.error('Error deleting multiple schedules:', error);
            throw new InternalServerErrorException('Failed to delete schedules');
        }
    }
}
