import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createNotification(createNotificationDto: CreateNotificationDto) {
        // Check if sender exists
        const sender = await this.prisma.user.findFirst({
            where: { id: createNotificationDto.sender_id },
        });

        if (!sender) {
            throw new NotFoundException('Sender not found');
        }

        try {
            const notification = await this.prisma.notification.create({
                data: {
                    ...createNotificationDto,
                    id: this.generateIdService.generateId(),
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                    recipients: {
                        include: {
                            recipient: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            return notification;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create notification',
                error.message
            );
        }
    }

    async updateNotification(
        id: string,
        updateNotificationDto: UpdateNotificationDto,
        user: User
    ) {
        const notification = await this.prisma.notification.findFirst({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        // Check permission - only admin or sender can update
        if (notification.sender_id !== user.id && user.role !== 4) {
            throw new ForbiddenException('You do not have permission to update this notification');
        }

        try {
            const updatedNotification = await this.prisma.notification.update({
                where: { id },
                data: updateNotificationDto,
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                    recipients: {
                        include: {
                            recipient: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            return updatedNotification;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update notification',
                error.message
            );
        }
    }

    async getNotificationById(id: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                recipients: {
                    include: {
                        recipient: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }

    async deleteNotification(id: string, user: User) {
        const notification = await this.prisma.notification.findFirst({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        // Check permission - only admin or sender can delete
        if (notification.sender_id !== user.id && user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete this notification'
            );
        }

        try {
            await this.prisma.notification.delete({
                where: { id },
            });
            return { message: 'Notification deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete notification',
                error.message
            );
        }
    }

    async getAllNotifications() {
        const notifications = await this.prisma.notification.findMany({
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                recipients: {
                    include: {
                        recipient: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        if (notifications.length === 0) {
            throw new NotFoundException('No notifications found');
        }
        return notifications;
    }

    async getNotificationsByType(type: number) {
        const notifications = await this.prisma.notification.findMany({
            where: { type },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                recipients: {
                    include: {
                        recipient: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        if (notifications.length === 0) {
            throw new NotFoundException('No notifications found for this type');
        }
        return notifications;
    }

    async getNotificationsBySender(senderId: string) {
        const notifications = await this.prisma.notification.findMany({
            where: { sender_id: senderId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                recipients: {
                    include: {
                        recipient: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        if (notifications.length === 0) {
            throw new NotFoundException('No notifications found for this sender');
        }
        return notifications;
    }

    async getNotificationsForRecipient(recipientId: string) {
        const notifications = await this.prisma.notification.findMany({
            where: {
                recipients: {
                    some: {
                        recipient_id: recipientId,
                    },
                },
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                recipients: {
                    where: {
                        recipient_id: recipientId,
                    },
                    include: {
                        recipient: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return notifications;
    }
}
