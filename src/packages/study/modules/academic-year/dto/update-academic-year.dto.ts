import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { AcademicYearStatusEnum } from '../../types/study.types';

export const UpdateAcademicYearSchema = z.object({
    school_year: z
        .string()
        .min(1, 'School year is required')
        .max(20, 'School year must not exceed 20 characters')
        .optional(),
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
        ),
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
        ),
    status: z.number().min(0).max(2).optional(),
});

export class UpdateAcademicYearDto extends createZodDto(
    UpdateAcademicYearSchema
) {
    @ApiProperty({
        description: 'School year identifier (unique)',
        example: '2024-2025',
        required: false,
    })
    school_year?: string;

    @ApiProperty({
        description: 'Start date of the academic year in ISO format',
        example: '2024-09-01T00:00:00.000Z',
        required: false,
    })
    start_date?: string;

    @ApiProperty({
        description: 'End date of the academic year in ISO format',
        example: '2025-06-30T23:59:59.999Z',
        required: false,
    })
    end_date?: string;

    @ApiProperty({
        description:
            'Status of the academic year (0 = INACTIVE, 1 = ACTIVE, 2 = COMPLETED)',
        example: AcademicYearStatusEnum.ACTIVE,
        enum: AcademicYearStatusEnum,
        enumName: 'AcademicYearStatusEnum',
        required: false,
    })
    status?: AcademicYearStatusEnum;
}
