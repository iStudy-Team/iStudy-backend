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
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';
import { CreateClassPromotionDto } from './dto/create-class-promotion.dto';
import { UpdateClassPromotionDto } from './dto/update-class-promotion.dto';
import { ClassPromotionService } from './class-promotion.service';

@ApiTags('Class Promotion')
@ApiExtraModels(CreateClassPromotionDto, UpdateClassPromotionDto)
@Controller('class-promotions')
export class ClassPromotionController {
    constructor(private readonly classPromotionService: ClassPromotionService) {}

    @ApiOperation({ summary: 'Create a new class promotion' })
    @ApiResponse({
        status: 201,
        description: 'Class promotion successfully created',
        type: CreateClassPromotionDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: User or Grade Level not found',
    })
    @Post()
    async createClassPromotion(@Body() createClassPromotionDto: CreateClassPromotionDto) {
        return this.classPromotionService.createClassPromotion(createClassPromotionDto);
    }

    @ApiOperation({ summary: 'Update an existing class promotion' })
    @ApiResponse({
        status: 200,
        description: 'Class promotion successfully updated',
        type: UpdateClassPromotionDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Class promotion not found for the provided ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: UpdateClassPromotionDto })
    @ApiParam({ name: 'id', type: String, description: 'Class Promotion ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateClassPromotion(
        @Param('id') id: string,
        @Body() updateClassPromotionDto: UpdateClassPromotionDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classPromotionService.updateClassPromotion(id, updateClassPromotionDto, req.user);
    }

    @ApiOperation({ summary: 'Get a class promotion by ID' })
    @ApiResponse({
        status: 200,
        description: 'Class promotion found',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Class promotion not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Class Promotion ID' })
    @Get(':id')
    async getClassPromotionById(@Param('id') id: string) {
        return this.classPromotionService.getClassPromotionById(id);
    }

    @ApiOperation({ summary: 'Delete a class promotion by ID' })
    @ApiResponse({
        status: 200,
        description: 'Class promotion successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Class promotion not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Class Promotion ID' })
    @ApiBearerAuth('JWT')
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteClassPromotion(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.classPromotionService.deleteClassPromotion(id, req.user);
    }

    @ApiOperation({ summary: 'Get all class promotions' })
    @ApiResponse({
        status: 200,
        description: 'List of all class promotions',
    })
    @Get()
    async getAllClassPromotions() {
        return this.classPromotionService.getAllClassPromotions();
    }

    @ApiOperation({ summary: 'Get active class promotions' })
    @ApiResponse({
        status: 200,
        description: 'List of active class promotions',
    })
    @Get('active/list')
    async getActiveClassPromotions() {
        return this.classPromotionService.getActiveClassPromotions();
    }

    @ApiOperation({ summary: 'Get class promotions by grade level' })
    @ApiResponse({
        status: 200,
        description: 'List of class promotions by grade level',
    })
    @ApiParam({ name: 'gradeLevelId', type: String, description: 'Grade Level ID' })
    @Get('grade-level/:gradeLevelId')
    async getClassPromotionsByGradeLevel(@Param('gradeLevelId') gradeLevelId: string) {
        return this.classPromotionService.getClassPromotionsByGradeLevel(gradeLevelId);
    }

    @ApiOperation({ summary: 'Get class promotions by status' })
    @ApiResponse({
        status: 200,
        description: 'List of class promotions by status',
    })
    @ApiQuery({
        name: 'status',
        type: Number,
        description: 'Status (0: Planned, 1: Active, 2: Completed, 3: Canceled)'
    })
    @Get('status/filter')
    async getClassPromotionsByStatus(@Query('status') status: string) {
        return this.classPromotionService.getClassPromotionsByStatus(parseInt(status));
    }
}
