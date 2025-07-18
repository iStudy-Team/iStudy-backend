import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateGradeLevelSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    description: z.string().optional(),
    academic_year_id: z
        .string()
        .min(1, 'Academic Year ID is required')
        .max(50, 'Academic Year ID must be less than 50 characters'),
});

export class CreateGradeLevelDto extends createZodDto(CreateGradeLevelSchema) {
    @ApiProperty({
        description: 'Name of the grade level',
        example: 'Grade 1',
        required: true,
    })
    name: string;

    @ApiProperty({
        description: 'Description of the grade level',
        example: 'This is the first grade level in primary education.',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'ID of the academic year this grade level belongs to',
        example: '2023-2024',
        required: true,
    })
    academic_year_id: string;
}
