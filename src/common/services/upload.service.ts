import { Injectable, BadRequestException } from '@nestjs/common';
import { store } from 'src/config/stores.config';
import { v4 as uuidv4 } from 'uuid';
import { UploadResponse } from 'imagekit/dist/libs/interfaces';
import 'multer';

@Injectable()
export class UploadService {
    constructor() {}

    /**
     * Upload file to ImageKit
     * @param file - The file to upload
     * @param folder - Optional folder path in ImageKit
     * @returns Upload result with file URL and details
     */
    async uploadFile(
        file: Express.Multer.File,
        folder?: string
    ): Promise<{
        url: string;
        fileId: string;
        name: string;
        size: number;
        filePath: string;
    }> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Validate file type (images only)
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only images are allowed.'
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            throw new BadRequestException(
                'File size too large. Maximum size is 10MB.'
            );
        }

        try {
            const fileName = `${uuidv4()}-${file.originalname}`;
            const filePath = folder ? `${folder}/${fileName}` : fileName;

            const uploadResponse = await store.upload({
                file: file.buffer,
                fileName: fileName,
                folder: folder || 'uploads',
                useUniqueFileName: false,
                tags: ['uploaded-from-api'],
            });

            return {
                url: uploadResponse.url,
                fileId: uploadResponse.fileId,
                name: uploadResponse.name,
                size: uploadResponse.size,
                filePath: uploadResponse.filePath,
            };
        } catch (error) {
            console.error('Error uploading file to ImageKit:', error);
            throw new BadRequestException('Failed to upload file');
        }
    }

    /**
     * Upload multiple files to ImageKit
     * @param files - Array of files to upload
     * @param folder - Optional folder path in ImageKit
     * @returns Array of upload results
     */
    async uploadMultipleFiles(
        files: Express.Multer.File[],
        folder?: string
    ): Promise<Array<{
        url: string;
        fileId: string;
        name: string;
        size: number;
        filePath: string;
    }>> {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        const uploadPromises = files.map(file =>
            this.uploadFile(file, folder)
        );

        try {
            return await Promise.all(uploadPromises);
        } catch (error) {
            throw new BadRequestException('Failed to upload one or more files');
        }
    }

    /**
     * Delete file from ImageKit
     * @param fileId - The file ID to delete
     * @returns Deletion result
     */
    async deleteFile(fileId: string): Promise<{ success: boolean }> {
        try {
            await store.deleteFile(fileId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting file from ImageKit:', error);
            throw new BadRequestException('Failed to delete file');
        }
    }

    /**
     * Get file details from ImageKit
     * @param fileId - The file ID
     * @returns File details
     */
    async getFileDetails(fileId: string): Promise<any> {
        try {
            return await store.getFileDetails(fileId);
        } catch (error) {
            console.error('Error getting file details from ImageKit:', error);
            throw new BadRequestException('Failed to get file details');
        }
    }
}
