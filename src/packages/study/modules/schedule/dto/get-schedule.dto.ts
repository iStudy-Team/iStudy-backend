import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const GetScheduleSchema = z.object({
    class_id: z.string().uuid().optional(),
    day: z.string().optional(),
});

export class GetScheduleDto extends createZodDto(GetScheduleSchema) {
    @ApiProperty({
        description: 'The ID of the class to filter schedules by',
        type: String,
        format: 'uuid',
        required: false,
    })
    class_id?: string;

    @ApiProperty({
        description: 'The day of the week to filter schedules by',
        type: String,
        required: false,
    })
    day?: string;
}
