import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { ClassStatusEnum } from '../../types/study.types';

export const UpdateClassSchema = z.object({
    academic_year_id: z.string().optional(),
    grade_level_id: z.string().optional(),
    name: z.string().min(1, { message: 'Class name is required' }).optional(),
    capacity: z.number().max(255).optional(),
    tuition_free: z.string().optional(),
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
    status: z.number().max(2).default(ClassStatusEnum.OPEN).optional(),
});

export class UpdateClassDto extends createZodDto(UpdateClassSchema) {
    @ApiProperty({
        description: 'Academic year ID this class belongs to',
        example: 'academic-year-2024-2025',
        required: false,
    })
    academic_year_id?: string;

    @ApiProperty({
        description: 'Grade level ID for this class',
        example: 'grade-1',
        required: false,
    })
    grade_level_id?: string;

    @ApiProperty({
        description: 'Name of the class',
        example: 'Class 1A',
        required: false,
    })
    name?: string;

    @ApiProperty({
        description: 'Maximum number of students in the class',
        example: 30,
        required: false,
    })
    capacity?: number;

    @ApiProperty({
        description: 'Indicates if the class is tuition-free',
        example: 'yes',
        required: false,
    })
    tuition_free?: string;

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
        description:
            'Status of the class (0 = OPEN, 1 = CLOSED, 2 = COMPLETED)',
        example: ClassStatusEnum.OPEN,
        required: false,
    })
    status?: ClassStatusEnum;
}
