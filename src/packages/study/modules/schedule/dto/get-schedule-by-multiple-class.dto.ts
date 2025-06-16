import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const GetScheduleByMultipleClassSchema = z.object({
    class_ids: z.array(z.string().min(1, 'At least one class ID is required')),
});

export class GetScheduleByMultipleClassDto extends createZodDto(
    GetScheduleByMultipleClassSchema
) {
    @ApiProperty({
        description: 'Array of class IDs to filter schedules by',
        type: [String],
        example: ['class_12345', 'class_67890'],
    })
    class_ids: string[];
}
