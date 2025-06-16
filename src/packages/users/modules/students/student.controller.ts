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
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentService } from './student.service';

@ApiTags('Student')
@ApiExtraModels(CreateStudentDto, UpdateStudentDto)
@Controller('students')
export class StudentController {
    constructor(private readonly studentService: StudentService) {}

    @ApiOperation({ summary: 'Create a new student' })
    @ApiResponse({
        status: 201,
        description: 'Student successfully created',
        type: CreateStudentDto,
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict: A student with this user ID already exists',
    })
    @Post()
    async createStudent(
        @Body() createStudentDto: CreateStudentDto,
    ) {
        return this.studentService.createStudent(createStudentDto);
    }

    @ApiOperation({ summary: 'Update an existing student' })
    @ApiResponse({
        status: 200,
        description: 'Student successfully updated',
        type: UpdateStudentDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Student not found for the provided ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: UpdateStudentDto })
    @ApiParam({ name: 'id', type: String, description: 'Student ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateStudent(
        @Param('id') id: string,
        @Body() updateStudentDto: UpdateStudentDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.studentService.updateStudent(
            id,
            updateStudentDto,
            req.user
        );
    }

    @ApiOperation({ summary: 'Get a student by ID' })
    @ApiResponse({
        status: 200,
        description: 'Student found',
        type: CreateStudentDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Student not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Student ID' })
    @Get(':id')
    async getStudentById(@Param('id') id: string) {
        return this.studentService.getStudentById(id);
    }

    @ApiOperation({ summary: 'Delete a student by ID' })
    @ApiResponse({
        status: 200,
        description: 'Student successfully deleted',
        type: CreateStudentDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Student not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Student ID' })
    @ApiBearerAuth('JWT')
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteStudent(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.studentService.deleteStudent(id, req.user);
    }

    @ApiOperation({ summary: 'Get all students' })
    @ApiResponse({
        status: 200,
        description: 'List of all students',
        type: [CreateStudentDto],
    })
    @Get()
    async getAllStudents() {
        return this.studentService.getAllStudents();
    }
}
