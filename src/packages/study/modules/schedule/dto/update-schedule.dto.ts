import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateScheduleSchema = z.object({
    class_id: z.string().min(1, 'Class ID is required').optional(),
    day: z
        .string()
        .optional()
        .refine(
            (date) => {
                if (!date) return true;
                const isoRegex =
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
                return isoRegex.test(date) && !isNaN(Date.parse(date));
            },
            {
                message:
                    'Date must be a valid ISO string (e.g., 2023-01-01T00:00:00.000Z)',
            }
        )
        .optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
});

export class UpdateScheduleDto extends createZodDto(UpdateScheduleSchema) {
    @ApiProperty({
        description: 'ID of the class this schedule belongs to',
        example: 'class_12345',
        required: false,
    })
    class_id?: string;
    @ApiProperty({
        description: 'Day of the schedule in ISO format',
        example: '2023-01-01T00:00:00.000Z',
        required: false,
    })
    day?: string;
    @ApiProperty({
        description: 'Start time of the schedule',
        example: '08:00',
        required: false,
    })
    start_time?: string;
    @ApiProperty({
        description: 'End time of the schedule',
        example: '10:00',
        required: false,
    })
    end_time?: string;
}
