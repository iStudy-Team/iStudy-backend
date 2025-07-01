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
    Patch,
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
import { CreateNotificationRecipientDto } from './dto/create-notification-recipient.dto';
import { UpdateNotificationRecipientDto } from './dto/update-notification-recipient.dto';
import { NotificationRecipientService } from './notification-recipient.service';

@ApiTags('Notification Recipient')
@ApiExtraModels(CreateNotificationRecipientDto, UpdateNotificationRecipientDto)
@Controller('notification-recipients')
export class NotificationRecipientController {
    constructor(private readonly notificationRecipientService: NotificationRecipientService) {}

    @ApiOperation({ summary: 'Create a new notification recipient' })
    @ApiResponse({
        status: 201,
        description: 'Notification recipient successfully created',
        type: CreateNotificationRecipientDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification or Recipient not found',
    })
    @Post()
    async createNotificationRecipient(@Body() createNotificationRecipientDto: CreateNotificationRecipientDto) {
        return this.notificationRecipientService.createNotificationRecipient(createNotificationRecipientDto);
    }

    @ApiOperation({ summary: 'Update an existing notification recipient' })
    @ApiResponse({
        status: 200,
        description: 'Notification recipient successfully updated',
        type: UpdateNotificationRecipientDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification recipient not found for the provided ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: UpdateNotificationRecipientDto })
    @ApiParam({ name: 'id', type: String, description: 'Notification Recipient ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateNotificationRecipient(
        @Param('id') id: string,
        @Body() updateNotificationRecipientDto: UpdateNotificationRecipientDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.notificationRecipientService.updateNotificationRecipient(id, updateNotificationRecipientDto, req.user);
    }

    @ApiOperation({ summary: 'Get a notification recipient by ID' })
    @ApiResponse({
        status: 200,
        description: 'Notification recipient found',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification recipient not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Notification Recipient ID' })
    @Get(':id')
    async getNotificationRecipientById(@Param('id') id: string) {
        return this.notificationRecipientService.getNotificationRecipientById(id);
    }

    @ApiOperation({ summary: 'Delete a notification recipient by ID' })
    @ApiResponse({
        status: 200,
        description: 'Notification recipient successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification recipient not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Notification Recipient ID' })
    @ApiBearerAuth('JWT')
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteNotificationRecipient(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.notificationRecipientService.deleteNotificationRecipient(id, req.user);
    }

    @ApiOperation({ summary: 'Get all notification recipients' })
    @ApiResponse({
        status: 200,
        description: 'List of all notification recipients',
    })
    @Get()
    async getAllNotificationRecipients() {
        return this.notificationRecipientService.getAllNotificationRecipients();
    }

    @ApiOperation({ summary: 'Get notification recipients by notification' })
    @ApiResponse({
        status: 200,
        description: 'List of notification recipients by notification',
    })
    @ApiParam({ name: 'notificationId', type: String, description: 'Notification ID' })
    @Get('notification/:notificationId')
    async getNotificationRecipientsByNotification(@Param('notificationId') notificationId: string) {
        return this.notificationRecipientService.getNotificationRecipientsByNotification(notificationId);
    }

    @ApiOperation({ summary: 'Get notification recipients by recipient' })
    @ApiResponse({
        status: 200,
        description: 'List of notification recipients by recipient',
    })
    @ApiParam({ name: 'recipientId', type: String, description: 'Recipient User ID' })
    @Get('recipient/:recipientId')
    async getNotificationRecipientsByRecipient(@Param('recipientId') recipientId: string) {
        return this.notificationRecipientService.getNotificationRecipientsByRecipient(recipientId);
    }

    @ApiOperation({ summary: 'Get notification recipients by status' })
    @ApiResponse({
        status: 200,
        description: 'List of notification recipients by status',
    })
    @ApiQuery({
        name: 'status',
        type: Number,
        description: 'Status (0: Pending, 1: Sent, 2: Failed, 3: Read)'
    })
    @Get('status/filter')
    async getNotificationRecipientsByStatus(@Query('status') status: string) {
        return this.notificationRecipientService.getNotificationRecipientsByStatus(parseInt(status));
    }

    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({
        status: 200,
        description: 'Notification marked as read',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Notification recipient not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Notification Recipient ID' })
    @ApiBearerAuth('JWT')
    @Patch(':id/read')
    @UseGuards(AuthGuard)
    async markAsRead(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.notificationRecipientService.markAsRead(id, req.user);
    }
}
