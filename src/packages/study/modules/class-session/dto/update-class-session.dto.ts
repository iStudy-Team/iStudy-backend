import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { ClassSessionStatusEnum } from '../../types/study.types';

export const UpdateClassSessionSchema = z.object({
    class_id: z
        .string()
        .min(1, {
            message: 'Class ID must be a non-empty string',
        })
        .optional(),
    teacher_id: z
        .string()
        .min(1, {
            message: 'Teacher ID must be a non-empty string',
        })
        .optional(),
    topic: z
        .string()
        .min(1, {
            message: 'Topic must be a non-empty string',
        })
        .optional(),
    description: z.string().optional(),
    date: z
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
    start_time: z
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
    end_time: z
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
    status: z
        .number()
        .max(2)
        .default(ClassSessionStatusEnum.SCHEDULED)
        .optional(),
    cacel_reason: z.string().optional(),
});

export class UpdateClassSessionDto extends createZodDto(
    UpdateClassSessionSchema
) {
    @ApiProperty({
        description: 'The ID of the class',
        example: 'class_123',
        required: false,
        type: String,
    })
    class_id?: string;

    @ApiProperty({
        description: 'The ID of the teacher',
        example: 'teacher_456',
        required: false,
        type: String,
    })
    teacher_id?: string;

    @ApiProperty({
        description: 'The topic of the class session',
        example: 'Introduction to Mathematics',
        required: false,
        type: String,
    })
    topic?: string;

    @ApiProperty({
        description: 'A brief description of the class session',
        example: 'This session covers basic algebra concepts.',
        required: false,
        type: String,
    })
    description?: string;

    @ApiProperty({
        description: 'The date of the class session in ISO format',
        example: '2023-01-01T00:00:00.000Z',
        required: false,
        type: String,
    })
    date?: string;

    @ApiProperty({
        description:
            'The start time of the class session in ISO format (optional)',
        example: '2023-01-01T09:00:00.000Z',
        required: false,
        type: String,
    })
    start_time?: string;

    @ApiProperty({
        description:
            'The end time of the class session in ISO format (optional)',
        example: '2023-01-01T10:00:00.000Z',
        required: false,
        type: String,
    })
    end_time?: string;

    @ApiProperty({
        description: 'The status of the class session (default is SCHEDULED)',
        example: ClassSessionStatusEnum.SCHEDULED,
        enum: ClassSessionStatusEnum,
        required: false,
        type: Number,
    })
    status?: ClassSessionStatusEnum;
    @ApiProperty({
        description: 'Reason for cancellation if the session is cancelled',
        example: 'Teacher unavailable',
        required: false,
        type: String,
    })
    cacel_reason?: string;
}
