import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatusEnum } from '../../types/study.types';

export const UpdateAttendanceSchema = z.object({
    class_id: z
        .string()
        .min(1, {
            message: 'Class session ID must be a non-empty string',
        })
        .optional(),
    student_id: z
        .string()
        .min(1, {
            message: 'Student ID must be a non-empty string',
        })
        .optional(),
    status: z.number().max(3).default(AttendanceStatusEnum.PRESENT).optional(),
    comment: z.string().optional(),
    recorded_at: z
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
});

export class UpdateAttendanceDto extends createZodDto(UpdateAttendanceSchema) {
    @ApiProperty({
        description: 'The ID of the class session',
        example: 'class_123',
        required: false,
        type: String,
    })
    class_id?: string;

    @ApiProperty({
        description: 'The ID of the student',
        example: 'student_456',
        required: false,
        type: String,
    })
    student_id?: string;

    @ApiProperty({
        description: 'The attendance status',
        example: AttendanceStatusEnum.PRESENT,
        enum: AttendanceStatusEnum,
        required: false,
        type: Number,
    })
    status?: AttendanceStatusEnum;

    @ApiProperty({
        description: 'Comment about the attendance',
        example: 'Student was present and attentive.',
        required: false,
    })
    comment?: string;

    @ApiProperty({
        description: 'Timestamp when the attendance was recorded',
        example: '2023-01-01T00:00:00.000Z',
        required: false,
        type: String,
    })
    recorded_at?: string;
}
