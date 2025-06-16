import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { SearchGradeLevelsDto } from './dto/search-grade-level.dto';
import { User } from '@prisma/client';

@Injectable()
export class GradeLevelService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createGradeLevel(
        createGradeLevelDto: CreateGradeLevelDto,
        user: User
    ) {
        const existingGradeLevel = await this.prisma.grade_Level.findFirst({
            where: { name: createGradeLevelDto.name },
        });

        if (existingGradeLevel) {
            throw new ConflictException('Already exists with this name');
        }

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to create '
            );
        }

        try {
            const GradeLevel = await this.prisma.grade_Level.create({
                data: {
                    ...createGradeLevelDto,
                    id: this.generateIdService.generateId(),
                },
            });
            return GradeLevel;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create',
                error.message
            );
        }
    }

    async updateGradeLevel(
        id: string,
        updateGradeLevelDto: UpdateGradeLevelDto,
        user: User
    ) {
        const GradeLevel = await this.prisma.grade_Level.findFirst({
            where: { id },
        });

        if (!GradeLevel) {
            throw new NotFoundException('Not found');
        }

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update '
            );
        }

        if (updateGradeLevelDto.name) {
            const existingGradeLevel = await this.prisma.grade_Level.findFirst({
                where: {
                    name: updateGradeLevelDto.name,
                    id: { not: id },
                },
            });

            if (existingGradeLevel) {
                throw new ConflictException(' already exists with this name');
            }
        }

        try {
            const updatedGradeLevel = await this.prisma.grade_Level.update({
                where: { id },
                data: updateGradeLevelDto,
            });
            return updatedGradeLevel;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update ',
                error.message
            );
        }
    }

    async getGradeLevelById(id: string) {
        const GradeLevel = await this.prisma.grade_Level.findFirst({
            where: { id },
            include: {
                classes: true,
            },
        });

        if (!GradeLevel) {
            throw new NotFoundException(' not found');
        }

        return GradeLevel;
    }

    async deleteGradeLevel(id: string, user: User) {
        const GradeLevel = await this.prisma.grade_Level.findFirst({
            where: { id },
        });

        if (!GradeLevel) {
            throw new NotFoundException(' not found');
        }

        if (user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete '
            );
        }

        try {
            await this.prisma.grade_Level.delete({
                where: { id },
            });
            return { message: 'Deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete ',
                error.message
            );
        }
    }

    async getAllGradeLevels() {
        const GradeLevels = await this.prisma.grade_Level.findMany({
            include: {
                classes: true, // Include related classes
            },
            orderBy: {
                created_at: 'desc', // Order by creation date
            },
        });

        if (GradeLevels.length === 0) {
            throw new NotFoundException('Not found');
        }

        return GradeLevels;
    }

    async searchGradeLevels(
        searchTerm: string,
        page: number = 1,
        limit: number = 10
    ) {
        const skip = (page - 1) * limit;

        const GradeLevels = await this.prisma.grade_Level.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: searchTerm,
                        },
                    },
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

        const totalCount = await this.prisma.grade_Level.count({
            where: {
                OR: [
                    {
                        name: {
                            contains: searchTerm,
                        },
                    },
                ],
            },
        });

        return {
            data: GradeLevels,
            totalCount,
            page,
            limit,
        };
    }
}
