import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiResponse,
    ApiExtraModels,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLogService } from './activity-log.service';

@ApiTags('Activity Logs')
@ApiExtraModels(CreateActivityLogDto, UpdateActivityLogDto)
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('activity-logs')
export class ActivityLogController {
    constructor(private readonly activityLogService: ActivityLogService) {}

    @ApiOperation({ summary: 'Create a new activity log' })
    @ApiResponse({
        status: 201,
        description: 'Activity log successfully created',
    })
    @Post()
    async createActivityLog(
        @Body() createActivityLogDto: CreateActivityLogDto,
    ) {
        return this.activityLogService.createActivityLog(createActivityLogDto);
    }

    @ApiOperation({ summary: 'Update an existing activity log' })
    @ApiResponse({
        status: 200,
        description: 'Activity log successfully updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Activity log not found',
    })
    @ApiParam({
        name: 'id',
        description: 'Activity log ID',
        type: 'string',
    })
    @Put(':id')
    async updateActivityLog(
        @Param('id') id: string,
        @Body() updateActivityLogDto: UpdateActivityLogDto,
    ) {
        return this.activityLogService.updateActivityLog(id, updateActivityLogDto);
    }

    @ApiOperation({ summary: 'Get an activity log by ID' })
    @ApiResponse({
        status: 200,
        description: 'Activity log found',
    })
    @ApiResponse({
        status: 404,
        description: 'Activity log not found',
    })
    @ApiParam({
        name: 'id',
        description: 'Activity log ID',
        type: 'string',
    })
    @Get(':id')
    async getActivityLogById(@Param('id') id: string) {
        return this.activityLogService.getActivityLogById(id);
    }

    @ApiOperation({ summary: 'Get all activity logs' })
    @ApiResponse({
        status: 200,
        description: 'List of activity logs',
    })
    @ApiQuery({
        name: 'user_id',
        description: 'Filter by user ID',
        required: false,
        type: 'string',
    })
    @ApiQuery({
        name: 'action',
        description: 'Filter by action (partial match)',
        required: false,
        type: 'string',
    })
    @ApiQuery({
        name: 'entity_type',
        description: 'Filter by entity type (partial match)',
        required: false,
        type: 'string',
    })
    @ApiQuery({
        name: 'ip_address',
        description: 'Filter by IP address',
        required: false,
        type: 'string',
    })
    @ApiQuery({
        name: 'startDate',
        description: 'Start date for filtering (ISO string)',
        required: false,
        type: 'string',
    })
    @ApiQuery({
        name: 'endDate',
        description: 'End date for filtering (ISO string)',
        required: false,
        type: 'string',
    })
    @Get()
    async getAllActivityLogs(
        @Query('user_id') user_id?: string,
        @Query('action') action?: string,
        @Query('entity_type') entity_type?: string,
        @Query('ip_address') ip_address?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const query = {
            user_id,
            action,
            entity_type,
            ip_address,
            startDate,
            endDate,
        };

        return this.activityLogService.getAllActivityLogs(query);
    }

    @ApiOperation({ summary: 'Get activity logs by user ID' })
    @ApiResponse({
        status: 200,
        description: 'List of activity logs for the user',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        type: 'string',
    })
    @Get('user/:userId')
    async getActivityLogsByUser(@Param('userId') userId: string) {
        return this.activityLogService.getActivityLogsByUser(userId);
    }

    @ApiOperation({ summary: 'Get activity logs by date range' })
    @ApiResponse({
        status: 200,
        description: 'List of activity logs in date range',
    })
    @ApiQuery({
        name: 'startDate',
        description: 'Start date (ISO string)',
        required: true,
        type: 'string',
    })
    @ApiQuery({
        name: 'endDate',
        description: 'End date (ISO string)',
        required: true,
        type: 'string',
    })
    @Get('range/date')
    async getActivityLogsByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.activityLogService.getActivityLogsByDateRange(startDate, endDate);
    }

    @ApiOperation({ summary: 'Get activity logs summary statistics' })
    @ApiResponse({
        status: 200,
        description: 'Activity logs summary data',
    })
    @ApiQuery({
        name: 'user_id',
        description: 'Filter by user ID',
        required: false,
        type: 'string',
    })
    @ApiQuery({
        name: 'startDate',
        description: 'Start date for filtering (ISO string)',
        required: false,
        type: 'string',
    })
    @ApiQuery({
        name: 'endDate',
        description: 'End date for filtering (ISO string)',
        required: false,
        type: 'string',
    })
    @Get('analytics/summary')
    async getActivityLogSummary(
        @Query('user_id') user_id?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const query = {
            user_id,
            startDate,
            endDate,
        };

        return this.activityLogService.getActivityLogSummary(query);
    }

    @ApiOperation({ summary: 'Bulk delete activity logs' })
    @ApiResponse({
        status: 200,
        description: 'Activity logs successfully deleted',
    })
    @Post('bulk-delete')
    async bulkDeleteActivityLogs(@Body() body: { ids: string[] }) {
        return this.activityLogService.bulkDeleteActivityLogs(body.ids);
    }

    @ApiOperation({ summary: 'Cleanup old activity logs' })
    @ApiResponse({
        status: 200,
        description: 'Old activity logs successfully cleaned up',
    })
    @ApiQuery({
        name: 'daysToKeep',
        description: 'Number of days to keep (default: 90)',
        required: false,
        type: 'number',
    })
    @Post('cleanup')
    async cleanupOldLogs(@Query('daysToKeep') daysToKeep?: number) {
        return this.activityLogService.cleanupOldLogs(daysToKeep ? Number(daysToKeep) : 90);
    }

    @ApiOperation({ summary: 'Delete an activity log' })
    @ApiResponse({
        status: 200,
        description: 'Activity log successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Activity log not found',
    })
    @ApiParam({
        name: 'id',
        description: 'Activity log ID',
        type: 'string',
    })
    @Delete(':id')
    async deleteActivityLog(@Param('id') id: string) {
        return this.activityLogService.deleteActivityLog(id);
    }
}
