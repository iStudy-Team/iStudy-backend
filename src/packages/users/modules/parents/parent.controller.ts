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
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { ParentService } from './parent.service';

@ApiTags('Parent')
@ApiExtraModels(CreateParentDto, UpdateParentDto)
@Controller('parents')
export class ParentController {
    constructor(private readonly parentService: ParentService) {}

    @ApiOperation({ summary: 'Create a new parent' })
    @ApiResponse({
        status: 201,
        description: 'Parent successfully created',
        type: CreateParentDto,
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict: A parent with this user ID already exists',
    })
    @Post()
    async createParent(@Body() createParentDto: CreateParentDto) {
        return this.parentService.createParent(createParentDto);
    }

    @ApiOperation({ summary: 'Update an existing parent' })
    @ApiResponse({
        status: 200,
        description: 'Parent successfully updated',
        type: UpdateParentDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Parent not found for the provided ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: UpdateParentDto })
    @ApiParam({ name: 'id', type: String, description: 'Parent ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateParent(
        @Param('id') id: string,
        @Body() updateParentDto: UpdateParentDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.parentService.updateParent(id, updateParentDto, req.user);
    }

    @ApiOperation({ summary: 'Get a parent by ID' })
    @ApiResponse({
        status: 200,
        description: 'Parent found',
        type: CreateParentDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Parent not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Parent ID' })
    @Get(':id')
    async getParentById(@Param('id') id: string) {
        return this.parentService.getParentById(id);
    }

    @ApiOperation({ summary: 'Delete a parent by ID' })
    @ApiResponse({
        status: 200,
        description: 'Parent successfully deleted',
        type: CreateParentDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Parent not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Parent ID' })
    @ApiBearerAuth('JWT')
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteParent(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.parentService.deleteParent(id, req.user);
    }

    @ApiOperation({ summary: 'Get all parents' })
    @ApiResponse({
        status: 200,
        description: 'List of all parents',
        type: [CreateParentDto],
    })
    @Get()
    async getAllParents() {
        return this.parentService.getAllParents();
    }
}
