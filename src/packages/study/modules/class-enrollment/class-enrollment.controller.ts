import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    UseGuards,
    Req,
    Query,
    Delete,
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
import { ClassEnrollmentService } from './class-enrollment.service';
import { CreateClassEnrollmentDto } from './dto/create-class-enrollment.dto';
import { UpdateClassEnrollmentDto } from './dto/update-class-enrollment.dto';

@ApiTags('Class Enrollment')
@Controller('class-enrollment')
export class ClassEnrollmentController {
    constructor(
        private readonly classEnrollmentService: ClassEnrollmentService
    ) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new class enrollment' })
    @ApiBody({ type: CreateClassEnrollmentDto })
    @ApiResponse({
        status: 201,
        description: 'Class enrollment created successfully',
    })
    async create(
        @Body() createClassEnrollmentDto: CreateClassEnrollmentDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classEnrollmentService.create(
            createClassEnrollmentDto,
            req.user
        );
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Update an existing class enrollment' })
    @ApiParam({ name: 'id', type: String, description: 'Class enrollment ID' })
    @ApiBody({ type: UpdateClassEnrollmentDto })
    @ApiResponse({
        status: 200,
        description: 'Class enrollment updated successfully',
    })
    async update(
        @Param('id') id: string,
        @Body() updateClassEnrollmentDto: UpdateClassEnrollmentDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classEnrollmentService.update(
            id,
            updateClassEnrollmentDto,
            req.user
        );
    }

    @Get('get-by-req-user')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Get a class enrollment by user id' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'Class enrollment retrieved successfully',
    })
    async findAll(
        @Req() req: AuthenticatedRequest,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.classEnrollmentService.finClassesByUserId(
            req.user.id,
            page,
            limit
        );
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Delete a class enrollment' })
    @ApiParam({ name: 'id', type: String, description: 'Class enrollment ID' })
    @ApiResponse({
        status: 200,
        description: 'Class enrollment deleted successfully',
    })
    async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.classEnrollmentService.delete(id, req.user);
    }

    @Get('class/:classId/students')
    @ApiOperation({ summary: 'Get students enrolled in a specific class' })
    @ApiParam({ name: 'classId', type: String, description: 'Class ID' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiResponse({
        status: 200,
        description: 'List of students enrolled in the class',
    })
    async getStudentsByClassId(
        @Param('classId') classId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.classEnrollmentService.getStudentsByClassId(classId, page, limit);
    }

    @Get('class/:classId')
    @ApiOperation({ summary: 'Get enrollments for a specific class' })
    @ApiParam({ name: 'classId', type: String, description: 'Class ID' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiResponse({
        status: 200,
        description: 'List of enrollments for the class',
    })
    async getEnrollmentsByClassId(
        @Param('classId') classId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.classEnrollmentService.getEnrollmentsByClassId(classId, page, limit);
    }
}
