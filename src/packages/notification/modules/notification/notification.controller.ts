import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    Delete,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import {
    ApiResponse,
    ApiExtraModels,
    ApiOperation,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiTags,
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notification')
@ApiExtraModels(CreateNotificationDto, UpdateNotificationDto)
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @ApiOperation({ summary: 'Create a new notification' })
    @ApiResponse({
        status: 201,
        description: 'Notification successfully created',
        type: CreateNotificationDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Sender not found',
    })
    @Post()
    async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationService.createNotification(createNotificationDto);
    }

    @ApiOperation({ summary: 'Update an existing notification' })
    @ApiResponse({
        status: 200,
        description: 'Notification successfully updated',
        type: UpdateNotificationDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification not found for the provided ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: UpdateNotificationDto })
    @ApiParam({ name: 'id', type: String, description: 'Notification ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateNotification(
        @Param('id') id: string,
        @Body() updateNotificationDto: UpdateNotificationDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.notificationService.updateNotification(id, updateNotificationDto, req.user);
    }

    @ApiOperation({ summary: 'Get a notification by ID' })
    @ApiResponse({
        status: 200,
        description: 'Notification found',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Notification ID' })
    @Get(':id')
    async getNotificationById(@Param('id') id: string) {
        return this.notificationService.getNotificationById(id);
    }

    @ApiOperation({ summary: 'Delete a notification by ID' })
    @ApiResponse({
        status: 200,
        description: 'Notification successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Notification ID' })
    @ApiBearerAuth('JWT')
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteNotification(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.notificationService.deleteNotification(id, req.user);
    }

    @ApiOperation({ summary: 'Get all notifications' })
    @ApiResponse({
        status: 200,
        description: 'List of all notifications',
    })
    @Get()
    async getAllNotifications() {
        return this.notificationService.getAllNotifications();
    }

    @ApiOperation({ summary: 'Get notifications by type' })
    @ApiResponse({
        status: 200,
        description: 'List of notifications by type',
    })
    @ApiQuery({
        name: 'type',
        type: Number,
        description: 'Notification type (0: Absence, 1: Payment Due, 2: Emergency, 3: Announcement, 4: Class Cancel)'
    })
    @Get('type/filter')
    async getNotificationsByType(@Query('type') type: string) {
        return this.notificationService.getNotificationsByType(parseInt(type));
    }

    @ApiOperation({ summary: 'Get notifications by sender' })
    @ApiResponse({
        status: 200,
        description: 'List of notifications by sender',
    })
    @ApiParam({ name: 'senderId', type: String, description: 'Sender User ID' })
    @Get('sender/:senderId')
    async getNotificationsBySender(@Param('senderId') senderId: string) {
        return this.notificationService.getNotificationsBySender(senderId);
    }

    @ApiOperation({ summary: 'Get notifications for a specific recipient' })
    @ApiResponse({
        status: 200,
        description: 'List of notifications for the recipient',
    })
    @ApiParam({ name: 'recipientId', type: String, description: 'Recipient User ID' })
    @Get('recipient/:recipientId')
    async getNotificationsForRecipient(@Param('recipientId') recipientId: string) {
        return this.notificationService.getNotificationsForRecipient(recipientId);
    }
}
