import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatusEnum } from '../../types/study.types';

export const CreateAttendanceSchema = z.object({
    class_session_id: z.string().min(1, {
        message: 'Class session ID must be a non-empty string',
    }),
    student_id: z.string().min(1, {
        message: 'Student ID must be a non-empty string',
    }),
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
        ),
});

export class CreateAttendanceDto extends createZodDto(CreateAttendanceSchema) {
    @ApiProperty({
        description: 'The ID of the class session',
        example: 'class_123',
    })
    class_session_id: string;

    @ApiProperty({
        description: 'The ID of the student',
        example: 'student_456',
    })
    student_id: string;

    @ApiProperty({
        description: 'The attendance status',
        example: AttendanceStatusEnum.PRESENT,
        enum: AttendanceStatusEnum,
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
    })
    recorded_at: string;
}
