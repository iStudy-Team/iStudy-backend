import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateNotificationRecipientSchema = z.object({
    status: z.number().int().min(0).max(3).optional(),
    error_message: z.string().optional(),
});

export class UpdateNotificationRecipientDto extends createZodDto(UpdateNotificationRecipientSchema) {
    @ApiProperty({
        description: 'Status (0: Pending, 1: Sent, 2: Failed, 3: Read)',
        example: 1,
        required: false,
    })
    status?: number;

    @ApiProperty({
        description: 'Error message if delivery failed',
        example: 'Email address not found',
        required: false,
    })
    error_message?: string;
}
