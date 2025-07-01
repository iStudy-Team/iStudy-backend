import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateNotificationRecipientDto } from './dto/create-notification-recipient.dto';
import { UpdateNotificationRecipientDto } from './dto/update-notification-recipient.dto';

@Injectable()
export class NotificationRecipientService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createNotificationRecipient(createNotificationRecipientDto: CreateNotificationRecipientDto) {
        // Check if notification exists
        const notification = await this.prisma.notification.findFirst({
            where: { id: createNotificationRecipientDto.notification_id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        // Check if recipient exists
        const recipient = await this.prisma.user.findFirst({
            where: { id: createNotificationRecipientDto.recipient_id },
        });

        if (!recipient) {
            throw new NotFoundException('Recipient not found');
        }

        try {
            const notificationRecipient = await this.prisma.notificationRecipient.create({
                data: {
                    ...createNotificationRecipientDto,
                    id: this.generateIdService.generateId(),
                },
                include: {
                    notification: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                        },
                    },
                    recipient: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            return notificationRecipient;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create notification recipient',
                error.message
            );
        }
    }

    async updateNotificationRecipient(
        id: string,
        updateNotificationRecipientDto: UpdateNotificationRecipientDto,
        user: User
    ) {
        const notificationRecipient = await this.prisma.notificationRecipient.findFirst({
            where: { id },
            include: {
                notification: true,
            },
        });

        if (!notificationRecipient) {
            throw new NotFoundException('Notification recipient not found');
        }

        // Check permission - only admin, sender, or recipient can update
        if (
            user.role !== 4 &&
            notificationRecipient.notification.sender_id !== user.id &&
            notificationRecipient.recipient_id !== user.id
        ) {
            throw new ForbiddenException('You do not have permission to update this notification recipient');
        }

        try {
            const updatedNotificationRecipient = await this.prisma.notificationRecipient.update({
                where: { id },
                data: {
                    ...updateNotificationRecipientDto,
                    sent_at: updateNotificationRecipientDto.status === 1 ? new Date() : undefined,
                },
                include: {
                    notification: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                        },
                    },
                    recipient: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            return updatedNotificationRecipient;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update notification recipient',
                error.message
            );
        }
    }

    async getNotificationRecipientById(id: string) {
        const notificationRecipient = await this.prisma.notificationRecipient.findFirst({
            where: { id },
            include: {
                notification: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        type: true,
                        created_at: true,
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
                recipient: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });

        if (!notificationRecipient) {
            throw new NotFoundException('Notification recipient not found');
        }

        return notificationRecipient;
    }

    async deleteNotificationRecipient(id: string, user: User) {
        const notificationRecipient = await this.prisma.notificationRecipient.findFirst({
            where: { id },
            include: {
                notification: true,
            },
        });

        if (!notificationRecipient) {
            throw new NotFoundException('Notification recipient not found');
        }

        // Check permission - only admin or sender can delete
        if (
            user.role !== 4 &&
            notificationRecipient.notification.sender_id !== user.id
        ) {
            throw new ForbiddenException(
                'You do not have permission to delete this notification recipient'
            );
        }

        try {
            await this.prisma.notificationRecipient.delete({
                where: { id },
            });
            return { message: 'Notification recipient deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete notification recipient',
                error.message
            );
        }
    }

    async getAllNotificationRecipients() {
        const notificationRecipients = await this.prisma.notificationRecipient.findMany({
            include: {
                notification: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                    },
                },
                recipient: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                sent_at: 'desc',
            },
        });

        if (notificationRecipients.length === 0) {
            throw new NotFoundException('No notification recipients found');
        }
        return notificationRecipients;
    }

    async getNotificationRecipientsByNotification(notificationId: string) {
        const notificationRecipients = await this.prisma.notificationRecipient.findMany({
            where: { notification_id: notificationId },
            include: {
                notification: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                    },
                },
                recipient: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                sent_at: 'desc',
            },
        });

        if (notificationRecipients.length === 0) {
            throw new NotFoundException('No notification recipients found for this notification');
        }
        return notificationRecipients;
    }

    async getNotificationRecipientsByRecipient(recipientId: string) {
        const notificationRecipients = await this.prisma.notificationRecipient.findMany({
            where: { recipient_id: recipientId },
            include: {
                notification: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        type: true,
                        created_at: true,
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
                recipient: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                sent_at: 'desc',
            },
        });

        return notificationRecipients;
    }

    async getNotificationRecipientsByStatus(status: number) {
        const notificationRecipients = await this.prisma.notificationRecipient.findMany({
            where: { status },
            include: {
                notification: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                    },
                },
                recipient: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                sent_at: 'desc',
            },
        });

        if (notificationRecipients.length === 0) {
            throw new NotFoundException('No notification recipients found for this status');
        }
        return notificationRecipients;
    }

    async markAsRead(id: string, user: User) {
        const notificationRecipient = await this.prisma.notificationRecipient.findFirst({
            where: { id },
        });

        if (!notificationRecipient) {
            throw new NotFoundException('Notification recipient not found');
        }

        // Check permission - only the recipient can mark as read
        if (notificationRecipient.recipient_id !== user.id && user.role !== 4) {
            throw new ForbiddenException('You can only mark your own notifications as read');
        }

        try {
            const updatedNotificationRecipient = await this.prisma.notificationRecipient.update({
                where: { id },
                data: {
                    status: 3, // Read
                },
                include: {
                    notification: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                        },
                    },
                    recipient: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            return updatedNotificationRecipient;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to mark notification as read',
                error.message
            );
        }
    }
}
