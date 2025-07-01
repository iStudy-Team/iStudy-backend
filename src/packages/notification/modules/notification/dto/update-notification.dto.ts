import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateNotificationSchema = z.object({
    type: z.number().int().min(0).max(4).optional(),
    title: z.string().min(1, 'Title is required').optional(),
    content: z.string().min(1, 'Content is required').optional(),
});

export class UpdateNotificationDto extends createZodDto(UpdateNotificationSchema) {
    @ApiProperty({
        description: 'Type of notification (0: Absence, 1: Payment Due, 2: Emergency, 3: Announcement, 4: Class Cancel)',
        example: 0,
        required: false,
    })
    type?: number;

    @ApiProperty({
        description: 'Title of the notification',
        example: 'Student Absence Alert',
        required: false,
    })
    title?: string;

    @ApiProperty({
        description: 'Content of the notification',
        example: 'Your child was absent from Math class today.',
        required: false,
    })
    content?: string;
}
