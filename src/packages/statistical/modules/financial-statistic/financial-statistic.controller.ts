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
import { CreateFinancialStatisticDto } from './dto/create-financial-statistic.dto';
import { UpdateFinancialStatisticDto } from './dto/update-financial-statistic.dto';
import { FinancialStatisticService } from './financial-statistic.service';

@ApiTags('Financial Statistics')
@ApiExtraModels(CreateFinancialStatisticDto, UpdateFinancialStatisticDto)
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('financial-statistics')
export class FinancialStatisticController {
    constructor(private readonly financialStatisticService: FinancialStatisticService) {}

    @ApiOperation({ summary: 'Create a new financial statistic' })
    @ApiResponse({
        status: 201,
        description: 'Financial statistic successfully created',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict: Financial statistic already exists for this period',
    })
    @Post()
    async createFinancialStatistic(
        @Body() createFinancialStatisticDto: CreateFinancialStatisticDto,
    ) {
        return this.financialStatisticService.createFinancialStatistic(createFinancialStatisticDto);
    }

    @ApiOperation({ summary: 'Update an existing financial statistic' })
    @ApiResponse({
        status: 200,
        description: 'Financial statistic successfully updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Financial statistic not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict: Financial statistic already exists for this period',
    })
    @ApiParam({
        name: 'id',
        description: 'Financial statistic ID',
        type: 'string',
    })
    @Put(':id')
    async updateFinancialStatistic(
        @Param('id') id: string,
        @Body() updateFinancialStatisticDto: UpdateFinancialStatisticDto,
    ) {
        return this.financialStatisticService.updateFinancialStatistic(id, updateFinancialStatisticDto);
    }

    @ApiOperation({ summary: 'Get a financial statistic by ID' })
    @ApiResponse({
        status: 200,
        description: 'Financial statistic found',
    })
    @ApiResponse({
        status: 404,
        description: 'Financial statistic not found',
    })
    @ApiParam({
        name: 'id',
        description: 'Financial statistic ID',
        type: 'string',
    })
    @Get(':id')
    async getFinancialStatisticById(@Param('id') id: string) {
        return this.financialStatisticService.getFinancialStatisticById(id);
    }

    @ApiOperation({ summary: 'Get all financial statistics' })
    @ApiResponse({
        status: 200,
        description: 'List of financial statistics',
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
    async getAllFinancialStatistics(
        @Query('year') year?: number,
        @Query('month') month?: number,
        @Query('startYear') startYear?: number,
        @Query('endYear') endYear?: number,
    ) {
        const query = {
            year: year ? Number(year) : undefined,
            month: month ? Number(month) : undefined,
            startYear: startYear ? Number(startYear) : undefined,
            endYear: endYear ? Number(endYear) : undefined,
        };

        return this.financialStatisticService.getAllFinancialStatistics(query);
    }

    @ApiOperation({ summary: 'Get financial statistics by date range' })
    @ApiResponse({
        status: 200,
        description: 'List of financial statistics in date range',
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
    async getFinancialStatisticsByDateRange(
        @Query('startYear') startYear: number,
        @Query('endYear') endYear: number,
        @Query('startMonth') startMonth?: number,
        @Query('endMonth') endMonth?: number,
    ) {
        return this.financialStatisticService.getFinancialStatisticsByDateRange(
            Number(startYear),
            Number(endYear),
            startMonth ? Number(startMonth) : undefined,
            endMonth ? Number(endMonth) : undefined,
        );
    }

    @ApiOperation({ summary: 'Get financial summary' })
    @ApiResponse({
        status: 200,
        description: 'Financial summary data',
    })
    @ApiQuery({
        name: 'year',
        description: 'Filter by year',
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
    @Get('summary')
    async getFinancialSummary(
        @Query('year') year?: number,
        @Query('startYear') startYear?: number,
        @Query('endYear') endYear?: number,
    ) {
        const query = {
            year: year ? Number(year) : undefined,
            startYear: startYear ? Number(startYear) : undefined,
            endYear: endYear ? Number(endYear) : undefined,
        };

        return this.financialStatisticService.getFinancialSummary(query);
    }

    @ApiOperation({ summary: 'Delete a financial statistic' })
    @ApiResponse({
        status: 200,
        description: 'Financial statistic successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Financial statistic not found',
    })
    @ApiParam({
        name: 'id',
        description: 'Financial statistic ID',
        type: 'string',
    })
    @Delete(':id')
    async deleteFinancialStatistic(@Param('id') id: string) {
        return this.financialStatisticService.deleteFinancialStatistic(id);
    }
}
