import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const DeleteMultipleSchedulesSchema = z.object({
    scheduleIds: z.array(z.string().min(1, 'Schedule ID cannot be empty')).min(1, 'At least one schedule ID is required'),
});

export class DeleteMultipleSchedulesDto extends createZodDto(DeleteMultipleSchedulesSchema) {
    @ApiProperty({
        description: 'Array of schedule IDs to delete',
        example: ['schedule_123', 'schedule_456'],
        type: [String],
    })
    scheduleIds: string[];
}

export const CreateMultipleSchedulesSchema = z.object({
    schedules: z.array(z.object({
        class_id: z.string().min(1, 'Class ID is required'),
        day: z.string().optional().refine(
            (date) => {
                if (!date) return true;
                const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
                return isoRegex.test(date) && !isNaN(Date.parse(date));
            },
            {
                message: 'Date must be a valid ISO string (e.g., 2023-01-01T00:00:00.000Z)',
            }
        ),
        start_time: z.string().optional(),
        end_time: z.string().optional(),
    })).min(1, 'At least one schedule is required'),
});

export class CreateMultipleSchedulesDto extends createZodDto(CreateMultipleSchedulesSchema) {
    @ApiProperty({
        description: 'Array of schedule data to create',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                class_id: { type: 'string', example: 'class_123' },
                day: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
                start_time: { type: 'string', example: '08:00' },
                end_time: { type: 'string', example: '10:00' },
            },
        },
    })
    schedules: Array<{
        class_id: string;
        day?: string;
        start_time?: string;
        end_time?: string;
    }>;
}
