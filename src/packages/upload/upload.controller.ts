import {
    Controller,
    Post,
    Delete,
    Get,
    Body,
    Param,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    Query,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { UploadService } from 'src/common/services/upload.service';
import {
    UploadFileDto,
    UploadResponseDto,
    MultipleUploadResponseDto,
    DeleteFileDto,
} from './dto/upload.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post('single')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a single image file' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file to upload',
                },
                folder: {
                    type: 'string',
                    description: 'Optional folder path',
                    example: 'avatars',
                },
            },
            required: ['file'],
        },
    })
    @ApiResponse({
        status: 201,
        description: 'File uploaded successfully',
        type: UploadResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid file or missing file',
    })
    async uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Query() uploadFileDto: UploadFileDto
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return await this.uploadService.uploadFile(file, uploadFileDto.folder);
    }

    @Post('multiple')
    @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload multiple image files (max 10)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Image files to upload (max 10)',
                },
                folder: {
                    type: 'string',
                    description: 'Optional folder path',
                    example: 'gallery',
                },
            },
            required: ['files'],
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Files uploaded successfully',
        type: MultipleUploadResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid files or no files provided',
    })
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Query() uploadFileDto: UploadFileDto
    ): Promise<{ files: UploadResponseDto[] }> {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        if (files.length > 10) {
            throw new BadRequestException('Maximum 10 files allowed');
        }

        const uploadedFiles = await this.uploadService.uploadMultipleFiles(
            files,
            uploadFileDto.folder
        );

        return { files: uploadedFiles };
    }

    @Delete(':fileId')
    @ApiOperation({ summary: 'Delete a file by file ID' })
    @ApiParam({
        name: 'fileId',
        description: 'The ID of the file to delete',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'File deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: {
                    type: 'boolean',
                    example: true,
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Failed to delete file',
    })
    async deleteFile(@Param('fileId') fileId: string): Promise<{ success: boolean }> {
        return await this.uploadService.deleteFile(fileId);
    }

    @Get('details/:fileId')
    @ApiOperation({ summary: 'Get file details by file ID' })
    @ApiParam({
        name: 'fileId',
        description: 'The ID of the file to get details for',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'File details retrieved successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Failed to get file details',
    })
    async getFileDetails(@Param('fileId') fileId: string): Promise<any> {
        return await this.uploadService.getFileDetails(fileId);
    }
}
