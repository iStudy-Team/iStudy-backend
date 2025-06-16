import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import {
    ClassTeacherStatusEnum,
    ClassTeacherRoleEnum,
} from '../../types/study.types';

export const CreateClassTeacherSchema = z.object({
    class_id: z.string().min(1, {
        message: 'Class ID must be a non-empty string',
    }),
    teacher_id: z.string().min(1, {
        message: 'Teacher ID must be a non-empty string',
    }),
    role: z.number().min(0).max(2),
    start_date: z
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
    end_date: z
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
    status: z.number().max(1).default(ClassTeacherStatusEnum.ACTIVE).optional(),
});

export class CreateClassTeacherDto extends createZodDto(
    CreateClassTeacherSchema
) {
    @ApiProperty({
        description: 'ID of the class',
        example: 'class_12345',
        required: true,
    })
    class_id: string;
    @ApiProperty({
        description: 'ID of the teacher',
        example: 'teacher_67890',
        required: true,
    })
    teacher_id: string;
    @ApiProperty({
        description: 'Role of the teacher in the class',
        example: ClassTeacherRoleEnum.MAIN_TEACHER,
        required: true,
    })
    role: ClassTeacherRoleEnum;

    @ApiProperty({
        description: 'Start date of the class in ISO format',
        example: '2024-09-01T00:00:00.000Z',
        required: false,
    })
    start_date?: string;

    @ApiProperty({
        description: 'End date of the class in ISO format',
        example: '2025-06-30T23:59:59.999Z',
        required: false,
    })
    end_date?: string;

    @ApiProperty({
        description: 'Status of the class (0 =INACTIVE, 1 = ACTIVE)',
        example: ClassTeacherStatusEnum.ACTIVE,
        required: false,
    })
    status?: ClassTeacherStatusEnum;
}
