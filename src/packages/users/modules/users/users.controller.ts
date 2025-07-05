import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    Delete,
    UseGuards,
    Query,
    UploadedFile,
    UseInterceptors,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiResponse,
    ApiExtraModels,
    ApiOperation,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiTags,
    ApiQuery,
    ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UploadService } from 'src/common/services/upload.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiExtraModels(CreateUserDto, UpdateUserDto, UserResponseDto)
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly uploadService: UploadService
    ) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid input data',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - Username or email already exists',
    })
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users with pagination' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page (default: 10)',
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                users: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserResponseDto' },
                },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 },
            },
        },
    })
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        return await this.usersService.findAll(page, limit);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: 'user_123456789',
    })
    @ApiResponse({
        status: 200,
        description: 'User found successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async findOne(@Param('id') id: string) {
        return await this.usersService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: 'user_123456789',
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - Username or email already exists',
    })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: 'user_123456789',
    })
    @ApiResponse({
        status: 200,
        description: 'User deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User deleted successfully' },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async remove(@Param('id') id: string) {
        return await this.usersService.remove(id);
    }

    @Post(':id/avatar')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload and update user avatar' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: 'user_123456789',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                    description: 'Avatar image file',
                },
            },
            required: ['avatar'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Avatar updated successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid file or upload failed',
    })
    async updateAvatar(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new Error('No file provided');
        }

        // Upload file to ImageKit
        const uploadResult = await this.uploadService.uploadFile(file, 'avatars');

        // Update user avatar in database
        return await this.usersService.updateAvatar(id, uploadResult.url);
    }

    @Get('username/:username')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Find user by username' })
    @ApiParam({
        name: 'username',
        description: 'Username',
        example: 'johndoe',
    })
    @ApiResponse({
        status: 200,
        description: 'User found successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async findByUsername(@Param('username') username: string) {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new Error('User not found');
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
