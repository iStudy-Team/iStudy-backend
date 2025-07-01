import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateFinancialStatisticDto } from './dto/create-financial-statistic.dto';
import { UpdateFinancialStatisticDto } from './dto/update-financial-statistic.dto';
import { StatisticQuery } from '../../types/statistical.types';

@Injectable()
export class FinancialStatisticService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createFinancialStatistic(createFinancialStatisticDto: CreateFinancialStatisticDto) {
        // Check if statistic already exists for this year and month
        const existingStatistic = await this.prisma.financialStatistic.findFirst({
            where: {
                year: createFinancialStatisticDto.year,
                month: createFinancialStatisticDto.month,
            },
        });

        if (existingStatistic) {
            throw new ConflictException(
                `Financial statistic already exists for ${createFinancialStatisticDto.month}/${createFinancialStatisticDto.year}`
            );
        }

        try {
            const statistic = await this.prisma.financialStatistic.create({
                data: {
                    ...createFinancialStatisticDto,
                    id: this.generateIdService.generateId(),
                    total_income: createFinancialStatisticDto.total_income ?? 0,
                    total_expenses: createFinancialStatisticDto.total_expenses ?? 0,
                    teacher_salaries: createFinancialStatisticDto.teacher_salaries ?? 0,
                    other_expenses: createFinancialStatisticDto.other_expenses ?? 0,
                    profit: createFinancialStatisticDto.profit ?? 0,
                    total_discounts: createFinancialStatisticDto.total_discounts ?? 0,
                    unpaid_invoices: createFinancialStatisticDto.unpaid_invoices ?? 0,
                },
            });
            return statistic;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create financial statistic',
                error.message
            );
        }
    }

    async updateFinancialStatistic(
        id: string,
        updateFinancialStatisticDto: UpdateFinancialStatisticDto,
    ) {
        const existingStatistic = await this.prisma.financialStatistic.findUnique({
            where: { id },
        });

        if (!existingStatistic) {
            throw new NotFoundException('Financial statistic not found');
        }

        // Check if updating year/month would create a conflict
        if (updateFinancialStatisticDto.year || updateFinancialStatisticDto.month) {
            const conflictingStatistic = await this.prisma.financialStatistic.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        {
                            year: updateFinancialStatisticDto.year ?? existingStatistic.year,
                            month: updateFinancialStatisticDto.month ?? existingStatistic.month,
                        },
                    ],
                },
            });

            if (conflictingStatistic) {
                throw new ConflictException(
                    `Financial statistic already exists for ${updateFinancialStatisticDto.month ?? existingStatistic.month}/${updateFinancialStatisticDto.year ?? existingStatistic.year}`
                );
            }
        }

        try {
            const updatedStatistic = await this.prisma.financialStatistic.update({
                where: { id },
                data: updateFinancialStatisticDto,
            });
            return updatedStatistic;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update financial statistic',
                error.message
            );
        }
    }

    async getFinancialStatisticById(id: string) {
        const statistic = await this.prisma.financialStatistic.findUnique({
            where: { id },
        });

        if (!statistic) {
            throw new NotFoundException('Financial statistic not found');
        }

        return statistic;
    }

    async getAllFinancialStatistics(query?: StatisticQuery) {
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

        const statistics = await this.prisma.financialStatistic.findMany({
            where,
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
            ],
        });

        return statistics;
    }

    async deleteFinancialStatistic(id: string) {
        const existingStatistic = await this.prisma.financialStatistic.findUnique({
            where: { id },
        });

        if (!existingStatistic) {
            throw new NotFoundException('Financial statistic not found');
        }

        try {
            await this.prisma.financialStatistic.delete({
                where: { id },
            });
            return { message: 'Financial statistic deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete financial statistic',
                error.message
            );
        }
    }

    async getFinancialStatisticsByDateRange(startYear: number, endYear: number, startMonth?: number, endMonth?: number) {
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

        const statistics = await this.prisma.financialStatistic.findMany({
            where,
            orderBy: [
                { year: 'asc' },
                { month: 'asc' },
            ],
        });

        return statistics;
    }

    async getFinancialSummary(query?: StatisticQuery) {
        const where: any = {};

        if (query?.year) {
            where.year = query.year;
        }

        if (query?.startYear && query?.endYear) {
            where.year = {
                gte: query.startYear,
                lte: query.endYear,
            };
        }

        const statistics = await this.prisma.financialStatistic.findMany({
            where,
            orderBy: [
                { year: 'asc' },
                { month: 'asc' },
            ],
        });

        if (statistics.length === 0) {
            return {
                period: query?.year ? `Year ${query.year}` : `${query?.startYear}-${query?.endYear}`,
                totalRecords: 0,
                totalIncome: 0,
                totalExpenses: 0,
                totalProfit: 0,
                averageMonthlyIncome: 0,
                averageMonthlyExpenses: 0,
                averageMonthlyProfit: 0,
            };
        }

        const totalIncome = statistics.reduce((sum, stat) => sum + Number(stat.total_income), 0);
        const totalExpenses = statistics.reduce((sum, stat) => sum + Number(stat.total_expenses), 0);
        const totalProfit = statistics.reduce((sum, stat) => sum + Number(stat.profit), 0);

        return {
            period: query?.year ? `Year ${query.year}` : `${query?.startYear}-${query?.endYear}`,
            totalRecords: statistics.length,
            totalIncome,
            totalExpenses,
            totalProfit,
            averageMonthlyIncome: totalIncome / statistics.length,
            averageMonthlyExpenses: totalExpenses / statistics.length,
            averageMonthlyProfit: totalProfit / statistics.length,
        };
    }
}
