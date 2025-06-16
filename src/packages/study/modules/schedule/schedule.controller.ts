import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
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

@ApiTags('Schedule')
@Controller('schedule')
@ApiExtraModels(
    CreateScheduleDto,
    UpdateScheduleDto,
    GetScheduleDto,
    GetScheduleByMultipleClassDto
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

    @Get(':id')
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
}
