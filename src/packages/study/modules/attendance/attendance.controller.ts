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
}
