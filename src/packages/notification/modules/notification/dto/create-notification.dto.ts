import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateNotificationSchema = z.object({
    type: z.number().int().min(0).max(4), // 0: Absence, 1: Payment Due, 2: Emergency, 3: Announcement, 4: Class Cancel
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    sender_id: z.string().min(1, 'Sender ID is required'),
});

export class CreateNotificationDto extends createZodDto(CreateNotificationSchema) {
    @ApiProperty({
        description: 'Type of notification (0: Absence, 1: Payment Due, 2: Emergency, 3: Announcement, 4: Class Cancel)',
        example: 0,
    })
    type: number;

    @ApiProperty({
        description: 'Title of the notification',
        example: 'Student Absence Alert',
    })
    title: string;

    @ApiProperty({
        description: 'Content of the notification',
        example: 'Your child was absent from Math class today.',
    })
    content: string;

    @ApiProperty({
        description: 'ID of the user sending the notification',
        example: 'user_12345',
    })
    sender_id: string;
}
