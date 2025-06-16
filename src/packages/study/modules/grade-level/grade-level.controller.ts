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
import { GradeLevelService } from './grade-level.service';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { SearchGradeLevelsDto } from './dto/search-grade-level.dto';

@ApiTags('Grade Level')
@Controller('grade-level')
@ApiExtraModels(CreateGradeLevelDto, UpdateGradeLevelDto, SearchGradeLevelsDto)
export class GradeLevelController {
    constructor(private readonly gradeLevelService: GradeLevelService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new grade level' })
    @ApiBody({ type: CreateGradeLevelDto })
    @ApiResponse({
        status: 201,
        description: 'The grade level has been successfully created.',
        type: CreateGradeLevelDto,
    })
    async create(
        @Body() createGradeLevelDto: CreateGradeLevelDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.gradeLevelService.createGradeLevel(
            createGradeLevelDto,
            req.user
        );
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Update an existing grade level' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'ID of the grade level',
    })
    @ApiBody({ type: UpdateGradeLevelDto })
    @ApiResponse({
        status: 200,
        description: 'The grade level has been successfully updated.',
        type: UpdateGradeLevelDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updateGradeLevelDto: UpdateGradeLevelDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.gradeLevelService.updateGradeLevel(
            id,
            updateGradeLevelDto,
            req.user
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a grade level by ID' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'ID of the grade level',
    })
    @ApiResponse({
        status: 200,
        description: 'The grade level has been successfully retrieved.',
        type: CreateGradeLevelDto,
    })
    async findOne(@Param('id') id: string) {
        return this.gradeLevelService.getGradeLevelById(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Delete a grade level by ID' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'ID of the grade level',
    })
    @ApiResponse({
        status: 200,
        description: 'The grade level has been successfully deleted.',
        type: CreateGradeLevelDto,
    })
    async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.gradeLevelService.deleteGradeLevel(id, req.user);
    }

    @Post('search/:searchTerm')
    @ApiOperation({ summary: 'Search for grade levels' })
    @ApiBody({ type: SearchGradeLevelsDto })
    @ApiResponse({
        status: 200,
        description: 'The grade levels have been successfully retrieved.',
        type: [CreateGradeLevelDto],
    })
    async search(
        @Body() searchGradeLevelsDto: SearchGradeLevelsDto,
        @Param('searchTerm') searchTerm: string
    ) {
        return this.gradeLevelService.searchGradeLevels(
            searchTerm,
            searchGradeLevelsDto.page,
            searchGradeLevelsDto.limit
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all grade levels' })
    @ApiResponse({
        status: 200,
        description: 'All grade levels have been successfully retrieved.',
        type: [CreateGradeLevelDto],
    })
    async findAll() {
        return this.gradeLevelService.getAllGradeLevels();
    }
}
