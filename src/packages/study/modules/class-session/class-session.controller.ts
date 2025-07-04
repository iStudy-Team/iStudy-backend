import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    UseGuards,
    Req,
    Delete,
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
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';
import { ClassSessionService } from './class-session.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@ApiTags('Class Session')
@Controller('class-session')
@ApiExtraModels(CreateClassSessionDto, UpdateClassSessionDto)
export class ClassSessionController {
    constructor(private readonly classSessionService: ClassSessionService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new class session' })
    @ApiBody({ type: CreateClassSessionDto })
    @ApiResponse({
        status: 201,
        description: 'Class session created successfully',
        type: CreateClassSessionDto,
    })
    async createClassSession(
        @Req() req: AuthenticatedRequest,
        @Body() createClassSessionDto: CreateClassSessionDto
    ) {
        return this.classSessionService.create(createClassSessionDto, req.user);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'id', required: true, description: 'Class Session ID' })
    @ApiOperation({ summary: 'Update an existing class session' })
    @ApiBody({ type: UpdateClassSessionDto })
    @ApiResponse({
        status: 200,
        description: 'Class session updated successfully',
        type: UpdateClassSessionDto,
    })
    async updateClassSession(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() updateClassSessionDto: UpdateClassSessionDto
    ) {
        return this.classSessionService.update(
            id,
            updateClassSessionDto,
            req.user
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get class sessions with optional classId filter' })
    @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiResponse({
        status: 200,
        description: 'List of class sessions',
        type: [CreateClassSessionDto],
    })
    async findAllClassSessions(
        @Query('classId') classId?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        if (classId) {
            return this.classSessionService.findByClassId(classId, page, limit);
        }
        return this.classSessionService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a class session by ID' })
    @ApiParam({ name: 'id', required: true, description: 'Class Session ID' })
    @ApiResponse({
        status: 200,
        description: 'Class session details',
        type: CreateClassSessionDto,
    })
    async findClassSessionById(@Param('id') id: string) {
        return this.classSessionService.findOne(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'id', required: true, description: 'Class Session ID' })
    @ApiOperation({ summary: 'Delete a class session' })
    @ApiResponse({
        status: 204,
        description: 'Class session deleted successfully',
    })
    async deleteClassSession(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classSessionService.remove(id, req.user);
    }

    @Get('/get-total/count')
    @ApiOperation({ summary: 'Get total count of class sessions' })
    @ApiResponse({
        status: 200,
        description: 'Total count of class sessions',
        type: Number,
    })
    async getTotalClassSessionCount() {
        return this.classSessionService.getTotalCount();
    }
}
