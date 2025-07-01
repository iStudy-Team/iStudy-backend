import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateClassPromotionSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    planned_start_date: z.string().datetime().optional(),
    tuition_fee: z.number().min(0, 'Tuition fee must be positive').optional(),
    max_students: z.number().int().min(1, 'Max students must be at least 1').optional(),
    promotion_start: z.string().datetime().optional(),
    promotion_end: z.string().datetime().optional(),
    discount_offered: z.number().min(0).max(100).optional(),
    status: z.number().int().min(0).max(3).optional(),
    converted_class_id: z.string().optional(),
});

export class UpdateClassPromotionDto extends createZodDto(UpdateClassPromotionSchema) {
    @ApiProperty({
        description: 'Title of the class promotion',
        example: 'Summer Math Class 2024',
        required: false,
    })
    title?: string;

    @ApiProperty({
        description: 'Description of the class promotion',
        example: 'Intensive math course for grade 10 students',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Planned start date of the class',
        example: '2024-06-01T00:00:00.000Z',
        required: false,
    })
    planned_start_date?: string;

    @ApiProperty({
        description: 'Tuition fee for the class',
        example: 500000,
        required: false,
    })
    tuition_fee?: number;

    @ApiProperty({
        description: 'Maximum number of students',
        example: 30,
        required: false,
    })
    max_students?: number;

    @ApiProperty({
        description: 'Promotion start date',
        example: '2024-05-01T00:00:00.000Z',
        required: false,
    })
    promotion_start?: string;

    @ApiProperty({
        description: 'Promotion end date',
        example: '2024-05-31T23:59:59.000Z',
        required: false,
    })
    promotion_end?: string;

    @ApiProperty({
        description: 'Discount percentage offered',
        example: 10,
        required: false,
    })
    discount_offered?: number;

    @ApiProperty({
        description: 'Status of the promotion (0: Planned, 1: Active, 2: Completed, 3: Canceled)',
        example: 0,
        required: false,
    })
    status?: number;

    @ApiProperty({
        description: 'ID of the converted class (if applicable)',
        example: 'class_12345',
        required: false,
    })
    converted_class_id?: string;
}
