import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    Query,
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
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
@ApiExtraModels(CreateAttendanceDto, UpdateAttendanceDto)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new attendance record' })
    @ApiBody({ type: CreateAttendanceDto })
    @ApiResponse({
        status: 201,
        description: 'Attendance record created successfully',
        type: CreateAttendanceDto,
    })
    async createAttendance(
        @Req() req: AuthenticatedRequest,
        @Body() createAttendanceDto: CreateAttendanceDto
    ) {
        return this.attendanceService.create(createAttendanceDto, req.user);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'id', required: true, description: 'Attendance ID' })
    @ApiOperation({ summary: 'Update an existing attendance record' })
    @ApiBody({ type: UpdateAttendanceDto })
    @ApiResponse({
        status: 200,
        description: 'Attendance record updated successfully',
        type: UpdateAttendanceDto,
    })
    async updateAttendance(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() updateAttendanceDto: UpdateAttendanceDto
    ) {
        return this.attendanceService.update(id, updateAttendanceDto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all attendance records' })
    @ApiResponse({
        status: 200,
        description: 'List of attendance records',
        type: [CreateAttendanceDto],
    })
    async getAllAttendance(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.attendanceService.findAll(page, limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get attendance record by ID' })
    @ApiParam({ name: 'id', required: true, description: 'Attendance ID' })
    @ApiResponse({
        status: 200,
        description: 'Attendance record found',
        type: CreateAttendanceDto,
    })
    async getAttendanceById(@Param('id') id: string) {
        return this.attendanceService.findOne(id);
    }

    @Post('bulk/:classSessionId')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create bulk attendance records for a class session' })
    @ApiParam({ name: 'classSessionId', required: true, description: 'Class Session ID' })
    @ApiResponse({
        status: 201,
        description: 'Bulk attendance records created successfully',
    })
    async createBulkAttendance(
        @Req() req: AuthenticatedRequest,
        @Param('classSessionId') classSessionId: string,
        @Body() attendanceRecords: Array<{
            student_id: string;
            status: number;
            comment?: string;
        }>
    ) {
        return this.attendanceService.createBulkAttendance(classSessionId, attendanceRecords, req.user);
    }

    @Get('class-session/:classSessionId')
    @ApiOperation({ summary: 'Get attendance records for a specific class session' })
    @ApiParam({ name: 'classSessionId', required: true, description: 'Class Session ID' })
    @ApiResponse({
        status: 200,
        description: 'Attendance records for the class session',
    })
    async getAttendanceByClassSession(@Param('classSessionId') classSessionId: string) {
        return this.attendanceService.findByClassSession(classSessionId);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get attendance statistics' })
    @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
    @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
    @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (YYYY-MM-DD)' })
    @ApiResponse({
        status: 200,
        description: 'Attendance statistics',
    })
    async getAttendanceStats(
        @Query('classId') classId?: string,
        @Query('studentId') studentId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string
    ) {
        return this.attendanceService.getAttendanceStats({
            classId,
            studentId,
            dateFrom,
            dateTo,
        });
    }
}
