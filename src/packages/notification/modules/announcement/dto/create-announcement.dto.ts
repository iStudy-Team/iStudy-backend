import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateAnnouncementSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    type: z.number().int().min(0).max(3).optional(), // 0: Popup, 1: Slider, 2: News, 3: Emergency
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    target_audience: z.number().int().min(0).max(3).optional(), // 0: All, 1: Parents, 2: Teachers, 3: Students
    status: z.number().int().min(0).max(1).optional(), // 0: Active, 1: Inactive
    created_by: z.string().min(1, 'Created by is required'),
});

export class CreateAnnouncementDto extends createZodDto(CreateAnnouncementSchema) {
    @ApiProperty({
        description: 'Title of the announcement',
        example: 'School Holiday Notice',
    })
    title: string;

    @ApiProperty({
        description: 'Content of the announcement',
        example: 'School will be closed from December 25th to January 2nd for winter break.',
    })
    content: string;

    @ApiProperty({
        description: 'Type of announcement (0: Popup, 1: Slider, 2: News, 3: Emergency)',
        example: 2,
        required: false,
        default: 0,
    })
    type?: number;

    @ApiProperty({
        description: 'Start date of the announcement',
        example: '2024-12-20T00:00:00.000Z',
        required: false,
    })
    start_date?: string;

    @ApiProperty({
        description: 'End date of the announcement',
        example: '2024-12-31T23:59:59.000Z',
        required: false,
    })
    end_date?: string;

    @ApiProperty({
        description: 'Target audience (0: All, 1: Parents, 2: Teachers, 3: Students)',
        example: 0,
        required: false,
        default: 0,
    })
    target_audience?: number;

    @ApiProperty({
        description: 'Status of the announcement (0: Active, 1: Inactive)',
        example: 0,
        required: false,
        default: 0,
    })
    status?: number;

    @ApiProperty({
        description: 'ID of the user who created the announcement',
        example: 'user_12345',
    })
    created_by: string;
}
