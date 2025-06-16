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
import { ClassTeacherService } from './class-teacher.service';
import { CreateClassTeacherDto } from './dto/create-class-teacher.dto';
import { UpdateClassTeacherDto } from './dto/update-class-teacher.dto';

@ApiTags('Class Teacher')
@Controller('class-teacher')
export class ClassTeacherController {
    constructor(private readonly classTeacherService: ClassTeacherService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new class teacher' })
    @ApiBody({ type: CreateClassTeacherDto })
    @ApiResponse({
        status: 201,
        description: 'Class teacher created successfully',
    })
    async create(
        @Body() createClassTeacherDto: CreateClassTeacherDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classTeacherService.create(createClassTeacherDto, req.user);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Update an existing class teacher' })
    @ApiParam({ name: 'id', type: String, description: 'Class teacher ID' })
    @ApiBody({ type: UpdateClassTeacherDto })
    @ApiResponse({
        status: 200,
        description: 'Class teacher updated successfully',
    })
    async update(
        @Param('id') id: string,
        @Body() updateClassTeacherDto: UpdateClassTeacherDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classTeacherService.update(
            updateClassTeacherDto,
            req.user,
            id
        );
    }

    @Delete(':id')
    @ApiBearerAuth('JWT')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete a class teacher' })
    @ApiParam({ name: 'id', type: String, description: 'Class teacher ID' })
    @ApiResponse({
        status: 200,
        description: 'Class teacher deleted successfully',
    })
    async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.classTeacherService.delete(id, req.user);
    }

    @Get('all')
    @ApiOperation({
        summary: 'Get all class teachers',
    })
    @ApiResponse({
        status: 200,
        description: 'List of all class teachers',
    })
    async findAll() {
        return this.classTeacherService.findAll();
    }

    @Get('get-by-id/:id')
    @ApiOperation({
        summary: 'Get class teacher by ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Class teacher ID' })
    @ApiResponse({
        status: 200,
        description: 'Class teacher details',
    })
    async findById(@Param('id') id: string) {
        return this.classTeacherService.findOne(id);
    }

    @Get('get-by-teacher-id/:teacherId')
    @ApiOperation({
        summary: 'Get class teacher by teacher ID',
    })
    @ApiParam({
        name: 'teacherId',
        type: String,
        description: 'Teacher ID',
    })
    @ApiResponse({
        status: 200,
        description: 'Class teacher details for the given teacher ID',
    })
    async findByTeacherId(@Param('teacherId') teacherId: string) {
        return this.classTeacherService.getByTeacherId(teacherId);
    }
}
