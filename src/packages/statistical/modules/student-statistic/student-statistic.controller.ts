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
import { CreateStudentStatisticDto } from './dto/create-student-statistic.dto';
import { UpdateStudentStatisticDto } from './dto/update-student-statistic.dto';
import { StudentStatisticService } from './student-statistic.service';

@ApiTags('Student Statistics')
@ApiExtraModels(CreateStudentStatisticDto, UpdateStudentStatisticDto)
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('student-statistics')
export class StudentStatisticController {
    constructor(
        private readonly studentStatisticService: StudentStatisticService
    ) {}

    @ApiOperation({ summary: 'Create a new student statistic' })
    @ApiResponse({
        status: 201,
        description: 'Student statistic successfully created',
    })
    @ApiResponse({
        status: 409,
        description:
            'Conflict: Student statistic already exists for this period',
    })
    @Post()
    async createStudentStatistic(
        @Body() createStudentStatisticDto: CreateStudentStatisticDto
    ) {
        return this.studentStatisticService.createStudentStatistic(
            createStudentStatisticDto
        );
    }

    // Move the /range route BEFORE the general GET route
    @ApiOperation({ summary: 'Get student statistics by date range' })
    @ApiResponse({
        status: 200,
        description: 'List of student statistics in date range',
    })
    @ApiQuery({
        name: 'startYear',
        description: 'Start year',
        required: true,
        type: 'number',
    })
    @ApiQuery({
        name: 'endYear',
        description: 'End year',
        required: true,
        type: 'number',
    })
    @ApiQuery({
        name: 'startMonth',
        description: 'Start month',
        required: false,
        type: 'number',
    })
    @ApiQuery({
        name: 'endMonth',
        description: 'End month',
        required: false,
        type: 'number',
    })
    @Get('range')
    async getStudentStatisticsByDateRange(
        @Query('startYear') startYear: number,
        @Query('endYear') endYear: number,
        @Query('startMonth') startMonth?: number,
        @Query('endMonth') endMonth?: number
    ) {
        return this.studentStatisticService.getStudentStatisticsByDateRange(
            Number(startYear),
            Number(endYear),
            startMonth ? Number(startMonth) : undefined,
            endMonth ? Number(endMonth) : undefined
        );
    }

    @ApiOperation({ summary: 'Get all student statistics' })
    @ApiResponse({
        status: 200,
        description: 'List of student statistics',
    })
    @ApiQuery({
        name: 'year',
        description: 'Filter by year',
        required: false,
        type: 'number',
    })
    @ApiQuery({
        name: 'month',
        description: 'Filter by month',
        required: false,
        type: 'number',
    })
    @ApiQuery({
        name: 'startYear',
        description: 'Start year for range filter',
        required: false,
        type: 'number',
    })
    @ApiQuery({
        name: 'endYear',
        description: 'End year for range filter',
        required: false,
        type: 'number',
    })
    @Get()
    async getAllStudentStatistics(
        @Query('year') year?: string,
        @Query('month') month?: string,
        @Query('startYear') startYear?: string,
        @Query('endYear') endYear?: string
    ) {
        const query = {
            year: year ? Number(year) : undefined,
            month: month ? Number(month) : undefined,
            startYear: startYear ? Number(startYear) : undefined,
            endYear: endYear ? Number(endYear) : undefined,
        };

        return this.studentStatisticService.getAllStudentStatistics(query);
    }

    @ApiOperation({ summary: 'Update an existing student statistic' })
    @ApiResponse({
        status: 200,
        description: 'Student statistic successfully updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Student statistic not found',
    })
    @ApiResponse({
        status: 409,
        description:
            'Conflict: Student statistic already exists for this period',
    })
    @ApiParam({
        name: 'id',
        description: 'Student statistic ID',
        type: 'string',
    })
    @Put(':id')
    async updateStudentStatistic(
        @Param('id') id: string,
        @Body() updateStudentStatisticDto: UpdateStudentStatisticDto
    ) {
        return this.studentStatisticService.updateStudentStatistic(
            id,
            updateStudentStatisticDto
        );
    }

    // Move the :id route to the end to avoid conflicts
    @ApiOperation({ summary: 'Get a student statistic by ID' })
    @ApiResponse({
        status: 200,
        description: 'Student statistic found',
    })
    @ApiResponse({
        status: 404,
        description: 'Student statistic not found',
    })
    @ApiParam({
        name: 'id',
        description: 'Student statistic ID',
        type: 'string',
    })
    @Get(':id')
    async getStudentStatisticById(@Param('id') id: string) {
        return this.studentStatisticService.getStudentStatisticById(id);
    }

    @ApiOperation({ summary: 'Delete a student statistic' })
    @ApiResponse({
        status: 200,
        description: 'Student statistic successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Student statistic not found',
    })
    @ApiParam({
        name: 'id',
        description: 'Student statistic ID',
        type: 'string',
    })
    @Delete(':id')
    async deleteStudentStatistic(@Param('id') id: string) {
        return this.studentStatisticService.deleteStudentStatistic(id);
    }
}
