import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateNotificationRecipientSchema = z.object({
    notification_id: z.string().min(1, 'Notification ID is required'),
    recipient_id: z.string().min(1, 'Recipient ID is required'),
    recipient_type: z.number().int().min(0).max(2), // 0: Parent, 1: Teacher, 2: Student
    delivery_method: z.number().int().min(0).max(4), // 0: App, 1: SMS, 2: Email, 3: Zalo, 4: Facebook
    status: z.number().int().min(0).max(3).optional(), // 0: Pending, 1: Sent, 2: Failed, 3: Read
    error_message: z.string().optional(),
});

export class CreateNotificationRecipientDto extends createZodDto(CreateNotificationRecipientSchema) {
    @ApiProperty({
        description: 'ID of the notification',
        example: 'notification_12345',
    })
    notification_id: string;

    @ApiProperty({
        description: 'ID of the recipient user',
        example: 'user_12345',
    })
    recipient_id: string;

    @ApiProperty({
        description: 'Type of recipient (0: Parent, 1: Teacher, 2: Student)',
        example: 0,
    })
    recipient_type: number;

    @ApiProperty({
        description: 'Delivery method (0: App, 1: SMS, 2: Email, 3: Zalo, 4: Facebook)',
        example: 0,
    })
    delivery_method: number;

    @ApiProperty({
        description: 'Status (0: Pending, 1: Sent, 2: Failed, 3: Read)',
        example: 0,
        required: false,
        default: 0,
    })
    status?: number;

    @ApiProperty({
        description: 'Error message if delivery failed',
        example: 'Email address not found',
        required: false,
    })
    error_message?: string;
}
