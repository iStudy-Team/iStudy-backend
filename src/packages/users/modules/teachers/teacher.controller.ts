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
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherService } from './teacher.service';
import {
    ApiTags,
    ApiResponse,
    ApiExtraModels,
    ApiOperation,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';

@ApiTags('Teacher')
@ApiExtraModels(CreateTeacherDto)
@Controller('teachers')
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) {}

    @ApiOperation({ summary: 'Create a new teacher' })
    @ApiResponse({
        status: 201,
        description: 'Teacher successfully created',
        type: CreateTeacherDto,
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict: A teacher with this user ID already exists',
    })
    @Post()
    async createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
        return this.teacherService.createTeacher(createTeacherDto);
    }

    @ApiOperation({ summary: 'Update an existing teacher' })
    @ApiResponse({
        status: 200,
        description: 'Teacher successfully updated',
        type: CreateTeacherDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Teacher not found for the provided user ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: CreateTeacherDto })
    @ApiParam({ name: 'id', type: String, description: 'Teacher ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateTeacher(
        @Body() updateTeacherDto: CreateTeacherDto,
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.teacherService.updateTeacher(
            req.user.id,
            id,
            updateTeacherDto
        );
    }

    @ApiOperation({ summary: 'Get a teacher by ID' })
    @ApiResponse({
        status: 200,
        description: 'Teacher found',
        type: CreateTeacherDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Teacher not found for the provided user ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Teacher ID' })
    @Get(':id')
    async getTeacherById(
        @Param('id') id: string,
    ) {
        return this.teacherService.getTeacherById(id);
    }

    @ApiOperation({ summary: 'Get all teachers' })
    @ApiResponse({
        status: 200,
        description: 'List of all teachers',
        type: [CreateTeacherDto],
    })
    @Get()
    async getAllTeachers() {
        return this.teacherService.getAllTeachers();
    }

    @ApiOperation({ summary: 'Delete a teacher by ID' })
    @ApiResponse({
        status: 200,
        description: 'Teacher successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Teacher not found for the provided user ID',
    })
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'id', type: String, description: 'Teacher ID' })
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteTeacher(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.teacherService.deleteTeacher(id, req.user);
    }
}
