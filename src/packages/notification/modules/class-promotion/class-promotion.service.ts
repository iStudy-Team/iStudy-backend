import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateClassPromotionDto } from './dto/create-class-promotion.dto';
import { UpdateClassPromotionDto } from './dto/update-class-promotion.dto';

@Injectable()
export class ClassPromotionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createClassPromotion(createClassPromotionDto: CreateClassPromotionDto) {
        // Check if user exists
        const user = await this.prisma.user.findFirst({
            where: { id: createClassPromotionDto.created_by },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if grade level exists
        const gradeLevel = await this.prisma.grade_Level.findFirst({
            where: { id: createClassPromotionDto.grade_level_id },
        });

        if (!gradeLevel) {
            throw new NotFoundException('Grade level not found');
        }

        // Check if converted class exists (if provided)
        if (createClassPromotionDto.converted_class_id) {
            const convertedClass = await this.prisma.class.findFirst({
                where: { id: createClassPromotionDto.converted_class_id },
            });

            if (!convertedClass) {
                throw new NotFoundException('Converted class not found');
            }
        }

        try {
            const classPromotion = await this.prisma.classPromotion.create({
                data: {
                    ...createClassPromotionDto,
                    id: this.generateIdService.generateId(),
                    planned_start_date: createClassPromotionDto.planned_start_date
                        ? new Date(createClassPromotionDto.planned_start_date) : null,
                    promotion_start: createClassPromotionDto.promotion_start
                        ? new Date(createClassPromotionDto.promotion_start) : null,
                    promotion_end: createClassPromotionDto.promotion_end
                        ? new Date(createClassPromotionDto.promotion_end) : null,
                },
                include: {
                    gradeLevel: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    convertedClass: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            return classPromotion;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create class promotion',
                error.message
            );
        }
    }

    async updateClassPromotion(
        id: string,
        updateClassPromotionDto: UpdateClassPromotionDto,
        user: User
    ) {
        const classPromotion = await this.prisma.classPromotion.findFirst({
            where: { id },
        });

        if (!classPromotion) {
            throw new NotFoundException('Class promotion not found');
        }

        // Check permission - only admin or creator can update
        if (classPromotion.created_by !== user.id && user.role !== 4) {
            throw new ForbiddenException('You do not have permission to update this class promotion');
        }

        // Check if converted class exists (if provided)
        if (updateClassPromotionDto.converted_class_id) {
            const convertedClass = await this.prisma.class.findFirst({
                where: { id: updateClassPromotionDto.converted_class_id },
            });

            if (!convertedClass) {
                throw new NotFoundException('Converted class not found');
            }
        }

        try {
            const updatedClassPromotion = await this.prisma.classPromotion.update({
                where: { id },
                data: {
                    ...updateClassPromotionDto,
                    planned_start_date: updateClassPromotionDto.planned_start_date
                        ? new Date(updateClassPromotionDto.planned_start_date) : undefined,
                    promotion_start: updateClassPromotionDto.promotion_start
                        ? new Date(updateClassPromotionDto.promotion_start) : undefined,
                    promotion_end: updateClassPromotionDto.promotion_end
                        ? new Date(updateClassPromotionDto.promotion_end) : undefined,
                },
                include: {
                    gradeLevel: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    convertedClass: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            return updatedClassPromotion;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update class promotion',
                error.message
            );
        }
    }

    async getClassPromotionById(id: string) {
        const classPromotion = await this.prisma.classPromotion.findFirst({
            where: { id },
            include: {
                gradeLevel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                convertedClass: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });

        if (!classPromotion) {
            throw new NotFoundException('Class promotion not found');
        }

        return classPromotion;
    }

    async deleteClassPromotion(id: string, user: User) {
        const classPromotion = await this.prisma.classPromotion.findFirst({
            where: { id },
        });

        if (!classPromotion) {
            throw new NotFoundException('Class promotion not found');
        }

        // Check permission - only admin or creator can delete
        if (classPromotion.created_by !== user.id && user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete this class promotion'
            );
        }

        try {
            await this.prisma.classPromotion.delete({
                where: { id },
            });
            return { message: 'Class promotion deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete class promotion',
                error.message
            );
        }
    }

    async getAllClassPromotions() {
        const classPromotions = await this.prisma.classPromotion.findMany({
            include: {
                gradeLevel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                convertedClass: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        if (classPromotions.length === 0) {
            throw new NotFoundException('No class promotions found');
        }
        return classPromotions;
    }

    async getActiveClassPromotions() {
        const currentDate = new Date();
        const classPromotions = await this.prisma.classPromotion.findMany({
            where: {
                status: 1, // Active
                OR: [
                    {
                        promotion_start: null,
                        promotion_end: null,
                    },
                    {
                        promotion_start: { lte: currentDate },
                        promotion_end: { gte: currentDate },
                    },
                    {
                        promotion_start: { lte: currentDate },
                        promotion_end: null,
                    },
                ],
            },
            include: {
                gradeLevel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                convertedClass: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return classPromotions;
    }

    async getClassPromotionsByGradeLevel(gradeLevelId: string) {
        const classPromotions = await this.prisma.classPromotion.findMany({
            where: { grade_level_id: gradeLevelId },
            include: {
                gradeLevel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                convertedClass: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        if (classPromotions.length === 0) {
            throw new NotFoundException('No class promotions found for this grade level');
        }
        return classPromotions;
    }

    async getClassPromotionsByStatus(status: number) {
        const classPromotions = await this.prisma.classPromotion.findMany({
            where: { status },
            include: {
                gradeLevel: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                convertedClass: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        if (classPromotions.length === 0) {
            throw new NotFoundException('No class promotions found for this status');
        }
        return classPromotions;
    }
}
