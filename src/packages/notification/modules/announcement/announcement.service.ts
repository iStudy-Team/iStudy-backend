import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createAnnouncement(createAnnouncementDto: CreateAnnouncementDto) {
        // Check if user exists
        const user = await this.prisma.user.findFirst({
            where: { id: createAnnouncementDto.created_by },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        try {
            const announcement = await this.prisma.announcement.create({
                data: {
                    ...createAnnouncementDto,
                    id: this.generateIdService.generateId(),
                    start_date: createAnnouncementDto.start_date ? new Date(createAnnouncementDto.start_date) : null,
                    end_date: createAnnouncementDto.end_date ? new Date(createAnnouncementDto.end_date) : null,
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            return announcement;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create announcement',
                error.message
            );
        }
    }

    async updateAnnouncement(
        id: string,
        updateAnnouncementDto: UpdateAnnouncementDto,
        user: User
    ) {
        const announcement = await this.prisma.announcement.findFirst({
            where: { id },
        });

        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        // Check permission - only admin or creator can update
        if (announcement.created_by !== user.id && user.role !== 4) {
            throw new ForbiddenException('You do not have permission to update this announcement');
        }

        try {
            const updatedAnnouncement = await this.prisma.announcement.update({
                where: { id },
                data: {
                    ...updateAnnouncementDto,
                    start_date: updateAnnouncementDto.start_date ? new Date(updateAnnouncementDto.start_date) : undefined,
                    end_date: updateAnnouncementDto.end_date ? new Date(updateAnnouncementDto.end_date) : undefined,
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            return updatedAnnouncement;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update announcement',
                error.message
            );
        }
    }

    async getAnnouncementById(id: string) {
        const announcement = await this.prisma.announcement.findFirst({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });

        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        return announcement;
    }

    async deleteAnnouncement(id: string, user: User) {
        const announcement = await this.prisma.announcement.findFirst({
            where: { id },
        });

        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        // Check permission - only admin or creator can delete
        if (announcement.created_by !== user.id && user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete this announcement'
            );
        }

        try {
            await this.prisma.announcement.delete({
                where: { id },
            });
            return { message: 'Announcement deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete announcement',
                error.message
            );
        }
    }

    async getAllAnnouncements() {
        const announcements = await this.prisma.announcement.findMany({
            include: {
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

        if (announcements.length === 0) {
            throw new NotFoundException('No announcements found');
        }
        return announcements;
    }

    async getActiveAnnouncements() {
        const currentDate = new Date();
        const announcements = await this.prisma.announcement.findMany({
            where: {
                status: 0, // Active
                OR: [
                    {
                        start_date: null,
                        end_date: null,
                    },
                    {
                        start_date: { lte: currentDate },
                        end_date: { gte: currentDate },
                    },
                    {
                        start_date: { lte: currentDate },
                        end_date: null,
                    },
                ],
            },
            include: {
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

        return announcements;
    }

    async getAnnouncementsByType(type: number) {
        const announcements = await this.prisma.announcement.findMany({
            where: { type },
            include: {
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

        if (announcements.length === 0) {
            throw new NotFoundException('No announcements found for this type');
        }
        return announcements;
    }

    async getAnnouncementsByTargetAudience(targetAudience: number) {
        const announcements = await this.prisma.announcement.findMany({
            where: {
                OR: [
                    { target_audience: 0 }, // All
                    { target_audience: targetAudience },
                ],
            },
            include: {
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

        return announcements;
    }
}
