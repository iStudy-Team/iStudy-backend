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
    ApiProperty,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { AcademicYearService } from './academic-year.service';
import { SearchAcademicYearsDto } from './dto/search-academic-year.dto';

@ApiTags('Academic Year')
@Controller('academic-year')
@ApiExtraModels(CreateAcademicYearDto, UpdateAcademicYearDto)
export class AcademicYearController {
    constructor(private readonly academicYearService: AcademicYearService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Create a new academic year' })
    @ApiBody({ type: CreateAcademicYearDto })
    @ApiResponse({
        status: 201,
        description: 'The academic year has been successfully created.',
        type: CreateAcademicYearDto,
    })
    @ApiBearerAuth('JWT')
    async create(
        @Body() createAcademicYearDto: CreateAcademicYearDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.academicYearService.createAcademicYear(
            createAcademicYearDto,
            req.user
        );
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update an existing academic year' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'ID of the academic year',
    })
    @ApiBody({ type: UpdateAcademicYearDto })
    @ApiResponse({
        status: 200,
        description: 'The academic year has been successfully updated.',
        type: UpdateAcademicYearDto,
    })
    @ApiBearerAuth('JWT')
    async update(
        @Param('id') id: string,
        @Body() updateAcademicYearDto: UpdateAcademicYearDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.academicYearService.updateAcademicYear(
            id,
            updateAcademicYearDto,
            req.user
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an academic year by ID' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'ID of the academic year',
    })
    @ApiResponse({
        status: 200,
        description: 'The academic year details.',
        type: CreateAcademicYearDto,
    })
    async findOne(@Param('id') id: string) {
        return this.academicYearService.getAcademicYearById(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete an academic year by ID' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'ID of the academic year',
    })
    @ApiResponse({
        status: 204,
        description: 'The academic year has been successfully deleted.',
    })
    @ApiBearerAuth('JWT')
    async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.academicYearService.deleteAcademicYear(id, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all academic years' })
    @ApiResponse({
        status: 200,
        description: 'List of all academic years.',
        type: [CreateAcademicYearDto],
    })
    async findAll(@Query() dto: SearchAcademicYearsDto) {
        return this.academicYearService.getAllAcademicYears(
            dto.page,
            dto.limit
        );
    }

    @Post('search/:searchTerm')
    @ApiOperation({ summary: 'Search academic years by name' })
    @ApiParam({
        name: 'searchTerm',
        type: String,
        description: 'Search term for academic year name',
    })
    @ApiResponse({
        status: 200,
        description: 'List of academic years matching the search term.',
        type: [CreateAcademicYearDto],
    })
    async searchAcademicYears(
        @Param('searchTerm') searchTerm: string,
        @Body() dto: SearchAcademicYearsDto
    ) {
        return this.academicYearService.searchAcademicYears(
            searchTerm,
            dto.page,
            dto.limit
        );
    }
}
