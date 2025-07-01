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
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AnnouncementService } from './announcement.service';

@ApiTags('Announcement')
@ApiExtraModels(CreateAnnouncementDto, UpdateAnnouncementDto)
@Controller('announcements')
export class AnnouncementController {
    constructor(private readonly announcementService: AnnouncementService) {}

    @ApiOperation({ summary: 'Create a new announcement' })
    @ApiResponse({
        status: 201,
        description: 'Announcement successfully created',
        type: CreateAnnouncementDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: User not found',
    })
    @Post()
    async createAnnouncement(@Body() createAnnouncementDto: CreateAnnouncementDto) {
        return this.announcementService.createAnnouncement(createAnnouncementDto);
    }

    @ApiOperation({ summary: 'Update an existing announcement' })
    @ApiResponse({
        status: 200,
        description: 'Announcement successfully updated',
        type: UpdateAnnouncementDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Announcement not found for the provided ID',
    })
    @ApiBearerAuth('JWT')
    @ApiBody({ type: UpdateAnnouncementDto })
    @ApiParam({ name: 'id', type: String, description: 'Announcement ID' })
    @Put(':id')
    @UseGuards(AuthGuard)
    async updateAnnouncement(
        @Param('id') id: string,
        @Body() updateAnnouncementDto: UpdateAnnouncementDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.announcementService.updateAnnouncement(id, updateAnnouncementDto, req.user);
    }

    @ApiOperation({ summary: 'Get an announcement by ID' })
    @ApiResponse({
        status: 200,
        description: 'Announcement found',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Announcement not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Announcement ID' })
    @Get(':id')
    async getAnnouncementById(@Param('id') id: string) {
        return this.announcementService.getAnnouncementById(id);
    }

    @ApiOperation({ summary: 'Delete an announcement by ID' })
    @ApiResponse({
        status: 200,
        description: 'Announcement successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Not Found: Announcement not found for the provided ID',
    })
    @ApiParam({ name: 'id', type: String, description: 'Announcement ID' })
    @ApiBearerAuth('JWT')
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteAnnouncement(
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.announcementService.deleteAnnouncement(id, req.user);
    }

    @ApiOperation({ summary: 'Get all announcements' })
    @ApiResponse({
        status: 200,
        description: 'List of all announcements',
    })
    @Get()
    async getAllAnnouncements() {
        return this.announcementService.getAllAnnouncements();
    }

    @ApiOperation({ summary: 'Get active announcements' })
    @ApiResponse({
        status: 200,
        description: 'List of active announcements',
    })
    @Get('active/list')
    async getActiveAnnouncements() {
        return this.announcementService.getActiveAnnouncements();
    }

    @ApiOperation({ summary: 'Get announcements by type' })
    @ApiResponse({
        status: 200,
        description: 'List of announcements by type',
    })
    @ApiQuery({
        name: 'type',
        type: Number,
        description: 'Announcement type (0: Popup, 1: Slider, 2: News, 3: Emergency)'
    })
    @Get('type/filter')
    async getAnnouncementsByType(@Query('type') type: string) {
        return this.announcementService.getAnnouncementsByType(parseInt(type));
    }

    @ApiOperation({ summary: 'Get announcements by target audience' })
    @ApiResponse({
        status: 200,
        description: 'List of announcements by target audience',
    })
    @ApiQuery({
        name: 'audience',
        type: Number,
        description: 'Target audience (0: All, 1: Parents, 2: Teachers, 3: Students)'
    })
    @Get('audience/filter')
    async getAnnouncementsByTargetAudience(@Query('audience') audience: string) {
        return this.announcementService.getAnnouncementsByTargetAudience(parseInt(audience));
    }
}
