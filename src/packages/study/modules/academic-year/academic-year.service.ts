import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { User } from '@prisma/client';

@Injectable()
export class AcademicYearService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createAcademicYear(
        createAcademicYearDto: CreateAcademicYearDto,
        user: User
    ) {
        const existingAcademicYear = await this.prisma.academic_Year.findFirst({
            where: { school_year: createAcademicYearDto.school_year },
        });

        if (existingAcademicYear) {
            throw new ConflictException(
                'Academic year already exists with this school year'
            );
        }

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create academic year'
            );
        }

        try {
            const academicYear = await this.prisma.academic_Year.create({
                data: {
                    ...createAcademicYearDto,
                    id: this.generateIdService.generateId(),
                    status: createAcademicYearDto.status ?? 0,
                },
            });
            return academicYear;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create academic year',
                error.message
            );
        }
    }

    async updateAcademicYear(
        id: string,
        updateAcademicYearDto: UpdateAcademicYearDto,
        user: User
    ) {
        const academicYear = await this.prisma.academic_Year.findFirst({
            where: { id },
        });

        if (!academicYear) {
            throw new NotFoundException('Academic year not found');
        }

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update academic year'
            );
        }

        if (updateAcademicYearDto.school_year) {
            const existingAcademicYear =
                await this.prisma.academic_Year.findFirst({
                    where: {
                        school_year: updateAcademicYearDto.school_year,
                        id: { not: id },
                    },
                });

            if (existingAcademicYear) {
                throw new ConflictException(
                    'Academic year already exists with this school year'
                );
            }
        }

        try {
            const updatedAcademicYear = await this.prisma.academic_Year.update({
                where: { id },
                data: updateAcademicYearDto,
            });
            return updatedAcademicYear;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update academic year',
                error.message
            );
        }
    }

    async getAcademicYearById(id: string) {
        const academicYear = await this.prisma.academic_Year.findFirst({
            where: { id },
            include: {
                classes: true,
            },
        });

        if (!academicYear) {
            throw new NotFoundException('Academic year not found');
        }

        return academicYear;
    }

    async deleteAcademicYear(id: string, user: User) {
        const academicYear = await this.prisma.academic_Year.findFirst({
            where: { id },
        });

        if (!academicYear) {
            throw new NotFoundException('Academic year not found');
        }

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete academic year'
            );
        }

        try {
            await this.prisma.academic_Year.delete({
                where: { id },
            });
            return { message: 'Academic year deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete academic year',
                error.message
            );
        }
    }

    async getAllAcademicYears(page?: number, limit?: number) {
        const shouldPaginate = page !== undefined && limit !== undefined;

        const skip = shouldPaginate ? Number((page - 1) * limit) : undefined;
        const take = shouldPaginate ? Number(limit) : undefined;

        const academicYears = await this.prisma.academic_Year.findMany({
            include: {
                classes: true,
            },
            orderBy: {
                created_at: 'desc',
            },
            skip,
            take,
        });

        if (academicYears.length === 0) {
            throw new NotFoundException('No academic years found');
        }

        return {
            data: academicYears,
            totalCount: await this.prisma.academic_Year.count(),
            page: shouldPaginate ? page : 1,
            limit: shouldPaginate ? limit : academicYears.length,
        };
    }

    async getActiveAcademicYear() {
        const activeAcademicYear = await this.prisma.academic_Year.findFirst({
            where: { status: 1 },
            include: {
                classes: true,
            },
        });

        if (!activeAcademicYear) {
            throw new NotFoundException('No active academic year found');
        }

        return activeAcademicYear;
    }

    async setActiveAcademicYear(id: string, user: User) {
        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to set active academic year'
            );
        }

        const academicYear = await this.prisma.academic_Year.findFirst({
            where: { id },
        });

        if (!academicYear) {
            throw new NotFoundException('Academic year not found');
        }

        try {
            await this.prisma.academic_Year.updateMany({
                where: { status: 1 },
                data: { status: 0 },
            });

            const activeAcademicYear = await this.prisma.academic_Year.update({
                where: { id },
                data: { status: 1 },
            });

            return activeAcademicYear;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to set active academic year',
                error.message
            );
        }
    }

    async searchAcademicYears(
        searchTerm: string,
        page: number = 1,
        limit: number = 10
    ) {
        const skip = (page - 1) * limit;

        const academicYears = await this.prisma.academic_Year.findMany({
            where: {
                OR: [
                    {
                        school_year: {
                            contains: searchTerm,
                        },
                    },
                    { status: { equals: parseInt(searchTerm) } },
                ],
            },
            skip,
            take: limit,
            include: {
                classes: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        const totalCount = await this.prisma.academic_Year.count({
            where: {
                OR: [
                    {
                        school_year: {
                            contains: searchTerm,
                        },
                    },
                    { status: { equals: parseInt(searchTerm) } },
                ],
            },
        });

        return {
            data: academicYears,
            totalCount,
            page,
            limit,
        };
    }
}
