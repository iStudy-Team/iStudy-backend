import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
    @ApiProperty({
        description: 'Optional folder path where the file will be stored',
        example: 'avatars',
        required: false,
    })
    @IsOptional()
    @IsString()
    folder?: string;
}

export class UploadResponseDto {
    @ApiProperty({
        description: 'URL of the uploaded file',
        example: 'https://ik.imagekit.io/your_imagekit_id/uploads/file.jpg',
    })
    url: string;

    @ApiProperty({
        description: 'Unique file identifier',
        example: '507f1f77bcf86cd799439011',
    })
    fileId: string;

    @ApiProperty({
        description: 'Name of the uploaded file',
        example: 'uuid-filename.jpg',
    })
    name: string;

    @ApiProperty({
        description: 'Size of the file in bytes',
        example: 1024000,
    })
    size: number;

    @ApiProperty({
        description: 'Full path of the file in storage',
        example: '/uploads/uuid-filename.jpg',
    })
    filePath: string;
}

export class MultipleUploadResponseDto {
    @ApiProperty({
        description: 'Array of uploaded file details',
        type: [UploadResponseDto],
    })
    files: UploadResponseDto[];
}

export class DeleteFileDto {
    @ApiProperty({
        description: 'File ID to delete',
        example: '507f1f77bcf86cd799439011',
    })
    @IsString()
    fileId: string;
}
