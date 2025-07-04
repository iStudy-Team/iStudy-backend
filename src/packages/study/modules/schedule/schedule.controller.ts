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
} from '@nestjs/common';
import {
    ApiResponse,
    ApiExtraModels,
    ApiOperation,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { GetScheduleByMultipleClassDto } from './dto/get-schedule-by-multiple-class.dto';
import { DeleteMultipleSchedulesDto, CreateMultipleSchedulesDto } from './dto/delete-schedule.dto';

@ApiTags('Schedule')
@Controller('schedule')
@ApiExtraModels(
    CreateScheduleDto,
    UpdateScheduleDto,
    GetScheduleDto,
    GetScheduleByMultipleClassDto,
    DeleteMultipleSchedulesDto,
    CreateMultipleSchedulesDto
)
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new schedule' })
    @ApiBody({ type: CreateScheduleDto })
    @ApiResponse({
        status: 201,
        description: 'The schedule has been successfully created.',
        type: CreateScheduleDto,
    })
    async create(
        @Body() createScheduleDto: CreateScheduleDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.scheduleService.createSchedule(req.user, createScheduleDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Update an existing schedule' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'The ID of the schedule to update',
    })
    @ApiBody({ type: UpdateScheduleDto })
    @ApiResponse({
        status: 200,
        description: 'The schedule has been successfully updated.',
        type: UpdateScheduleDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updateScheduleDto: UpdateScheduleDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.scheduleService.updateSchedule(
            req.user,
            id,
            updateScheduleDto
        );
    }

    @Get('/get-by-id/:id')
    @ApiOperation({ summary: 'Get a schedule by ID' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'The ID of the schedule to retrieve',
    })
    @ApiResponse({
        status: 200,
        description: 'The schedule has been successfully retrieved.',
        type: GetScheduleDto,
    })
    async getById(@Param('id') id: string) {
        return this.scheduleService.getScheduleById(id);
    }

    @Post('get-by-class-or-day')
    @ApiOperation({ summary: 'Get schedules by class or day' })
    @ApiBody({ type: GetScheduleDto })
    async getByClass(@Body() getScheduleDto: GetScheduleDto) {
        return this.scheduleService.getSchedules(getScheduleDto);
    }

    @Post('get-by-multiple-classes')
    @ApiOperation({ summary: 'Get schedules by multiple classes' })
    @ApiBody({ type: GetScheduleByMultipleClassDto })
    async getByMultipleClasses(
        @Body() getScheduleByMultipleClassDto: GetScheduleByMultipleClassDto
    ) {
        return this.scheduleService.getSchedulesByMultipleClasses(
            getScheduleByMultipleClassDto
        );
    }

    @Get('get-by-student')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Get schedules by student' })
    @ApiResponse({
        status: 200,
        description: 'The schedules have been successfully retrieved.',
        type: [GetScheduleDto],
    })
    async getByUser(@Req() req: AuthenticatedRequest) {
        return this.scheduleService.getScheduleByStudentId(req.user.id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Delete a schedule (preserve related sessions)' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'The ID of the schedule to delete',
    })
    @ApiResponse({
        status: 200,
        description: 'The schedule has been successfully deleted.',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                deletedSchedule: { type: 'object' },
            },
        },
    })
    async delete(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.scheduleService.deleteSchedule(req.user, id);
    }

    @Delete(':id/with-sessions')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Delete a schedule and all related class sessions' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'The ID of the schedule to delete along with sessions',
    })
    @ApiResponse({
        status: 200,
        description: 'The schedule and related sessions have been successfully deleted.',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                deletedSchedule: { type: 'object' },
                deletedSessionsCount: { type: 'number' },
                deletedSessions: { type: 'array' },
            },
        },
    })
    async deleteWithSessions(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.scheduleService.deleteScheduleAndSessions(req.user, id);
    }

    @Delete('batch')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Delete multiple schedules and their related sessions' })
    @ApiBody({ type: DeleteMultipleSchedulesDto })
    @ApiResponse({
        status: 200,
        description: 'The schedules and related sessions have been successfully deleted.',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                deletedCount: { type: 'number' },
                deletedSchedules: { type: 'array' },
                totalDeletedSessions: { type: 'number' },
            },
        },
    })
    async deleteMultiple(
        @Body() deleteMultipleDto: DeleteMultipleSchedulesDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.scheduleService.deleteMultipleSchedules(req.user, deleteMultipleDto.scheduleIds);
    }

    @Post('create-multiple')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create multiple schedules with overlap validation' })
    @ApiBody({ type: CreateMultipleSchedulesDto })
    @ApiResponse({
        status: 201,
        description: 'The schedules have been successfully created.',
        schema: {
            type: 'array',
            items: { type: 'object' },
        },
    })
    async createMultiple(
        @Body() createMultipleDto: CreateMultipleSchedulesDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.scheduleService.createMultipleSchedules(req.user, createMultipleDto.schedules);
    }

    @Get('/get-by-teacher')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Get schedules by teacher' })
    @ApiResponse({
        status: 200,
        description: 'The schedules have been successfully retrieved.',
        type: [GetScheduleDto],
    })
    async getByTeacher(@Req() req: AuthenticatedRequest) {
        return this.scheduleService.getSchedulesByTeacherId(req.user.id);
    }
}
