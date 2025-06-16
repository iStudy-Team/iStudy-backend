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

@Injectable()
export class ScheduleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createSchedule(user: User, createScheduleDto: CreateScheduleDto) {
        const { class_id, day, start_time, end_time } = createScheduleDto;

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create a schedule'
            );
        }

        // Check if the class exists and belongs to the user's school
        const classExists = await this.prisma.class.findFirst({
            where: {
                id: class_id,
            },
        });

        if (!classExists) {
            throw new NotFoundException('Class not found');
        }

        // Check if a schedule already exists for the same class and day
        const existingSchedule = await this.prisma.schedule.findFirst({
            where: {
                class_id,
                day,
            },
        });

        if (existingSchedule) {
            throw new ConflictException(
                'Schedule already exists for this class on this day'
            );
        }

        try {
            return await this.prisma.schedule.create({
                data: {
                    id: this.generateIdService.generateId(),
                    class_id,
                    day,
                    start_time,
                    end_time,
                },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to create schedule');
        }
    }

    async updateSchedule(
        user: User,
        scheduleId: string,
        updateScheduleDto: UpdateScheduleDto
    ) {
        const { class_id } = updateScheduleDto;

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update a schedule'
            );
        }

        if (class_id === updateScheduleDto.class_id) {
            throw new ConflictException(
                'Class ID cannot be the same as the current class ID'
            );
        }

        // Check if the schedule exists
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
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
        }

        // Update the schedule
        try {
            return await this.prisma.schedule.update({
                where: { id: scheduleId },
                data: updateScheduleDto,
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
                orderBy: {
                    day: 'asc',
                    start_time: 'asc',
                },
            });
            return schedules;
        } else if (getScheduleDto.day && !getScheduleDto.class_id) {
            const schedules = await this.prisma.schedule.findMany({
                where: {
                    day: getScheduleDto.day,
                },
                include: {
                    class: true,
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
                class: true,
            },
            orderBy: {
                day: 'asc',
                start_time: 'asc',
            },
        });
        if (schedules.length === 0) {
            throw new NotFoundException(
                'No schedules found for the provided class IDs'
            );
        }
        return schedules;
    }
}
