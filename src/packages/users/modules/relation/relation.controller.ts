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
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { RelationService } from './relation.service';

@ApiTags('Student Parent Relation')
@ApiExtraModels(CreateRelationDto, UpdateRelationDto)
@Controller('relations')
export class RelationController {
    constructor(private readonly relationService: RelationService) {}

    @ApiOperation({ summary: 'Create a new student-parent relation' })
    @ApiResponse({
        status: 201,
        description: 'Relation successfully created',
        type: CreateRelationDto,
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict: A relation between this student and parent already exists',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Student or Parent not found',
    })
    @Post()
    async createRelation(@Body() createRelationDto: CreateRelationDto) {
        return this.relationService.createRelation(createRelationDto);
    }

    @ApiOperation({ summary: 'Update an existing student-parent relation' })
    @ApiResponse({
        status: 200,
        description: 'Relation successfully updated',
        type: UpdateRelationDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Relation not found for the provided ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: UpdateRelationDto })
    @ApiParam({ name: 'id', type: String, description: 'Relation ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateRelation(
        @Param('id') id: string,
        @Body() updateRelationDto: UpdateRelationDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.relationService.updateRelation(id, updateRelationDto, req.user);
    }

    @ApiOperation({ summary: 'Get a relation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Relation found',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Relation not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Relation ID' })
    @Get(':id')
    async getRelationById(@Param('id') id: string) {
        return this.relationService.getRelationById(id);
    }

    @ApiOperation({ summary: 'Delete a relation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Relation successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Relation not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Relation ID' })
    @ApiBearerAuth('JWT')
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteRelation(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.relationService.deleteRelation(id, req.user);
    }

    @ApiOperation({ summary: 'Get all relations' })
    @ApiResponse({
        status: 200,
        description: 'List of all student-parent relations',
    })
    @Get()
    async getAllRelations() {
        return this.relationService.getAllRelations();
    }

    @ApiOperation({ summary: 'Get all relations for a specific student' })
    @ApiResponse({
        status: 200,
        description: 'List of relations for the student',
    })
    @ApiResponse({
        status: 404,
        description: 'No relations found for this student',
    })
    @ApiParam({ name: 'studentId', type: String, description: 'Student ID' })
    @Get('student/:studentId')
    async getRelationsByStudentId(@Param('studentId') studentId: string) {
        return this.relationService.getRelationsByStudentId(studentId);
    }

    @ApiOperation({ summary: 'Get all relations for a specific parent' })
    @ApiResponse({
        status: 200,
        description: 'List of relations for the parent',
    })
    @ApiResponse({
        status: 404,
        description: 'No relations found for this parent',
    })
    @ApiParam({ name: 'parentId', type: String, description: 'Parent ID' })
    @Get('parent/:parentId')
    async getRelationsByParentId(@Param('parentId') parentId: string) {
        return this.relationService.getRelationsByParentId(parentId);
    }
}
