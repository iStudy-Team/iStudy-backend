import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { ClassEnrollmentStatusEnum } from '../../types/study.types';

export const CreateClassEnrollmentSchema = z.object({
    class_id: z.string().min(1, {
        message: 'Class ID must be a non-empty string',
    }),
    enrollment_date: z
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
    status: z
        .number()
        .max(2)
        .default(ClassEnrollmentStatusEnum.ACTIVE)
        .optional(),
    tuition_fee: z.string().optional(),
    original_fee: z.string().optional(),
    discount_percentage: z.number().min(0).max(100).optional(),
});

export class CreateClassEnrollmentDto extends createZodDto(
    CreateClassEnrollmentSchema
) {
    @ApiProperty({
        description: 'ID of the class',
        example: 'class_12345',
        required: true,
    })
    class_id: string;

    @ApiProperty({
        description: 'Enrollment date of the class in ISO format',
        example: '2024-09-01T00:00:00.000Z',
        required: false,
    })
    enrollment_date?: string;

    @ApiProperty({
        description: 'End date of the class in ISO format',
        example: '2025-06-30T23:59:59.999Z',
        required: false,
    })
    end_date?: string;

    @ApiProperty({
        description: 'Status of the class (0 =INACTIVE, 1 = ACTIVE, 2 = COMPLETED)',
        example: ClassEnrollmentStatusEnum.ACTIVE,
        required: false,
    })
    status?: ClassEnrollmentStatusEnum;

    @ApiProperty({
        description: 'Tuition fee for the class',
        example: '1000.00',
        required: false,
    })
    tuition_fee?: string;

    @ApiProperty({
        description: 'Original fee for the class',
        example: '1200.00',
        required: false,
    })
    original_fee?: string;

    @ApiProperty({
        description: 'Discount percentage for the class',
        example: 10,
        required: false,
    })
    discount_percentage?: number;
}
