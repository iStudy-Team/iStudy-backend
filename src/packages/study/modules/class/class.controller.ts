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
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { SearchClasssDto } from './dto/search-class.dto';

@ApiTags('Class')
@Controller('class')
@ApiExtraModels(CreateClassDto, UpdateClassDto, SearchClasssDto)
export class ClassController {
    constructor(private readonly classService: ClassService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new class' })
    @ApiBody({ type: CreateClassDto })
    @ApiResponse({
        status: 201,
        description: 'Class created successfully',
        type: CreateClassDto,
    })
    async createClass(
        @Req() req: AuthenticatedRequest,
        @Body() createClassDto: CreateClassDto
    ) {
        return this.classService.createClass(req.user, createClassDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'id', required: true, description: 'Class ID' })
    @ApiOperation({ summary: 'Update an existing class' })
    @ApiBody({ type: UpdateClassDto })
    @ApiResponse({
        status: 200,
        description: 'Class updated successfully',
        type: UpdateClassDto,
    })
    async updateClass(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() updateClassDto: UpdateClassDto
    ) {
        return this.classService.updateClass(req.user, id, updateClassDto);
    }

    @Get('get-by-id/:id')
    @ApiParam({ name: 'id', required: true, description: 'Class ID' })
    @ApiOperation({ summary: 'Get class by ID' })
    @ApiResponse({
        status: 200,
        description: 'Class retrieved successfully',
    })
    async getClassById(@Param('id') id: string) {
        return this.classService.getClassById(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'id', required: true, description: 'Class ID' })
    @ApiOperation({ summary: 'Delete a class' })
    @ApiResponse({
        status: 200,
        description: 'Class deleted successfully',
    })
    async deleteClass(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classService.deleteClass(req.user, id);
    }

    @Get('search/:searchTerm')
    @ApiParam({
        name: 'searchTerm',
        required: true,
        description: 'Search term for classes',
    })
    @ApiOperation({ summary: 'Search classes by term' })
    @ApiResponse({
        status: 200,
        description: 'Classes searched successfully',
    })
    async searchClassesByTerm(
        @Param('searchTerm') searchTerm: string,
        @Body() searchClasssDto: SearchClasssDto
    ) {
        return this.classService.searchClasses(searchTerm, searchClasssDto);
    }

    @Get('all')
    @ApiOperation({ summary: 'Get all classes' })
    @ApiResponse({
        status: 200,
        description: 'All classes retrieved successfully',
    })
    async getAllClasses() {
        return this.classService.getAllClasses();
    }

    @Get('get-pagination')
    @ApiOperation({ summary: 'Get classes with pagination' })
    @ApiResponse({
        status: 200,
        description: 'Classes retrieved with pagination successfully',
    })
    async getClassesWithPagination(@Body() dto: SearchClasssDto) {
        return this.classService.getPagination(dto.page || 1, dto.limit || 10);
    }
}
