import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLogQuery, ActivityLogSummary } from '../../types/activity.types';

@Injectable()
export class ActivityLogService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createActivityLog(createActivityLogDto: CreateActivityLogDto) {
        try {
            const activityLog = await this.prisma.activityLog.create({
                data: {
                    ...createActivityLogDto,
                    id: this.generateIdService.generateId(),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
            return activityLog;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create activity log',
                error.message
            );
        }
    }

    async updateActivityLog(
        id: string,
        updateActivityLogDto: UpdateActivityLogDto,
    ) {
        const existingLog = await this.prisma.activityLog.findUnique({
            where: { id },
        });

        if (!existingLog) {
            throw new NotFoundException('Activity log not found');
        }

        try {
            const updatedLog = await this.prisma.activityLog.update({
                where: { id },
                data: updateActivityLogDto,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
            return updatedLog;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update activity log',
                error.message
            );
        }
    }

    async getActivityLogById(id: string) {
        const activityLog = await this.prisma.activityLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!activityLog) {
            throw new NotFoundException('Activity log not found');
        }

        return activityLog;
    }

    async getAllActivityLogs(query?: ActivityLogQuery) {
        const where: any = {};

        if (query?.user_id) {
            where.user_id = query.user_id;
        }

        if (query?.action) {
            where.action = {
                contains: query.action,
                mode: 'insensitive',
            };
        }

        if (query?.entity_type) {
            where.entity_type = {
                contains: query.entity_type,
                mode: 'insensitive',
            };
        }

        if (query?.ip_address) {
            where.ip_address = query.ip_address;
        }

        if (query?.startDate || query?.endDate) {
            where.created_at = {};
            if (query.startDate) {
                where.created_at.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.created_at.lte = new Date(query.endDate);
            }
        }

        const activityLogs = await this.prisma.activityLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return activityLogs;
    }

    async deleteActivityLog(id: string) {
        const existingLog = await this.prisma.activityLog.findUnique({
            where: { id },
        });

        if (!existingLog) {
            throw new NotFoundException('Activity log not found');
        }

        try {
            await this.prisma.activityLog.delete({
                where: { id },
            });
            return { message: 'Activity log deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete activity log',
                error.message
            );
        }
    }

    async getActivityLogsByUser(userId: string) {
        const activityLogs = await this.prisma.activityLog.findMany({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return activityLogs;
    }

    async getActivityLogsByDateRange(startDate: string, endDate: string) {
        const activityLogs = await this.prisma.activityLog.findMany({
            where: {
                created_at: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return activityLogs;
    }

    async getActivityLogSummary(query?: ActivityLogQuery): Promise<ActivityLogSummary> {
        const where: any = {};

        if (query?.user_id) {
            where.user_id = query.user_id;
        }

        if (query?.startDate || query?.endDate) {
            where.created_at = {};
            if (query.startDate) {
                where.created_at.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.created_at.lte = new Date(query.endDate);
            }
        }

        // Get total count
        const totalLogs = await this.prisma.activityLog.count({ where });

        // Get unique users count
        const uniqueUsers = await this.prisma.activityLog.findMany({
            where,
            select: { user_id: true },
            distinct: ['user_id'],
        });

        // Get top actions
        const actionStats = await this.prisma.activityLog.groupBy({
            by: ['action'],
            where,
            _count: {
                action: true,
            },
            orderBy: {
                _count: {
                    action: 'desc',
                },
            },
            take: 10,
        });

        // Get top entity types
        const entityStats = await this.prisma.activityLog.groupBy({
            by: ['entity_type'],
            where: {
                ...where,
                entity_type: {
                    not: null,
                },
            },
            _count: {
                entity_type: true,
            },
            orderBy: {
                _count: {
                    entity_type: 'desc',
                },
            },
            take: 10,
        });

        return {
            totalLogs,
            uniqueUsers: uniqueUsers.length,
            topActions: actionStats.map(stat => ({
                action: stat.action,
                count: stat._count.action,
            })),
            topEntityTypes: entityStats.map(stat => ({
                entity_type: stat.entity_type || 'Unknown',
                count: stat._count.entity_type,
            })),
        };
    }

    async bulkDeleteActivityLogs(ids: string[]) {
        try {
            const deleteResult = await this.prisma.activityLog.deleteMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
            });

            return {
                message: `Successfully deleted ${deleteResult.count} activity logs`,
                deletedCount: deleteResult.count,
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to bulk delete activity logs',
                error.message
            );
        }
    }

    async cleanupOldLogs(daysToKeep: number = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        try {
            const deleteResult = await this.prisma.activityLog.deleteMany({
                where: {
                    created_at: {
                        lt: cutoffDate,
                    },
                },
            });

            return {
                message: `Successfully cleaned up ${deleteResult.count} old activity logs`,
                deletedCount: deleteResult.count,
                cutoffDate: cutoffDate.toISOString(),
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to cleanup old activity logs',
                error.message
            );
        }
    }
}
