import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateStudentStatisticDto } from './dto/create-student-statistic.dto';
import { UpdateStudentStatisticDto } from './dto/update-student-statistic.dto';
import { StatisticQuery } from '../../types/statistical.types';

@Injectable()
export class StudentStatisticService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createStudentStatistic(createStudentStatisticDto: CreateStudentStatisticDto) {
        // Check if statistic already exists for this year and month
        const existingStatistic = await this.prisma.studentStatistic.findFirst({
            where: {
                year: createStudentStatisticDto.year,
                month: createStudentStatisticDto.month,
            },
        });

        if (existingStatistic) {
            throw new ConflictException(
                `Student statistic already exists for ${createStudentStatisticDto.month}/${createStudentStatisticDto.year}`
            );
        }

        try {
            const statistic = await this.prisma.studentStatistic.create({
                data: {
                    ...createStudentStatisticDto,
                    id: this.generateIdService.generateId(),
                    total_students: createStudentStatisticDto.total_students ?? 0,
                    new_students: createStudentStatisticDto.new_students ?? 0,
                    inactive_students: createStudentStatisticDto.inactive_students ?? 0,
                },
            });
            return statistic;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create student statistic',
                error.message
            );
        }
    }

    async updateStudentStatistic(
        id: string,
        updateStudentStatisticDto: UpdateStudentStatisticDto,
    ) {
        const existingStatistic = await this.prisma.studentStatistic.findUnique({
            where: { id },
        });

        if (!existingStatistic) {
            throw new NotFoundException('Student statistic not found');
        }

        // Check if updating year/month would create a conflict
        if (updateStudentStatisticDto.year || updateStudentStatisticDto.month) {
            const conflictingStatistic = await this.prisma.studentStatistic.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        {
                            year: updateStudentStatisticDto.year ?? existingStatistic.year,
                            month: updateStudentStatisticDto.month ?? existingStatistic.month,
                        },
                    ],
                },
            });

            if (conflictingStatistic) {
                throw new ConflictException(
                    `Student statistic already exists for ${updateStudentStatisticDto.month ?? existingStatistic.month}/${updateStudentStatisticDto.year ?? existingStatistic.year}`
                );
            }
        }

        try {
            const updatedStatistic = await this.prisma.studentStatistic.update({
                where: { id },
                data: updateStudentStatisticDto,
            });
            return updatedStatistic;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update student statistic',
                error.message
            );
        }
    }

    async getStudentStatisticById(id: string) {
        const statistic = await this.prisma.studentStatistic.findUnique({
            where: { id },
        });

        if (!statistic) {
            throw new NotFoundException('Student statistic not found');
        }

        return statistic;
    }

    async getAllStudentStatistics(query?: StatisticQuery) {
        const where: any = {};

        if (query?.year) {
            where.year = query.year;
        }

        if (query?.month) {
            where.month = query.month;
        }

        if (query?.startYear && query?.endYear) {
            where.year = {
                gte: query.startYear,
                lte: query.endYear,
            };
        }

        const statistics = await this.prisma.studentStatistic.findMany({
            where,
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
            ],
        });

        return statistics;
    }

    async deleteStudentStatistic(id: string) {
        const existingStatistic = await this.prisma.studentStatistic.findUnique({
            where: { id },
        });

        if (!existingStatistic) {
            throw new NotFoundException('Student statistic not found');
        }

        try {
            await this.prisma.studentStatistic.delete({
                where: { id },
            });
            return { message: 'Student statistic deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete student statistic',
                error.message
            );
        }
    }

    async getStudentStatisticsByDateRange(startYear: number, endYear: number, startMonth?: number, endMonth?: number) {
        const where: any = {
            year: {
                gte: startYear,
                lte: endYear,
            },
        };

        if (startMonth && endMonth) {
            where.OR = [];

            if (startYear === endYear) {
                // Same year range
                where.month = {
                    gte: startMonth,
                    lte: endMonth,
                };
                delete where.OR;
            } else {
                // Different years
                where.OR.push(
                    {
                        year: startYear,
                        month: { gte: startMonth },
                    },
                    {
                        year: endYear,
                        month: { lte: endMonth },
                    }
                );

                if (endYear - startYear > 1) {
                    where.OR.push({
                        year: {
                            gt: startYear,
                            lt: endYear,
                        },
                    });
                }
            }
        }

        const statistics = await this.prisma.studentStatistic.findMany({
            where,
            orderBy: [
                { year: 'asc' },
                { month: 'asc' },
            ],
        });

        return statistics;
    }
}
