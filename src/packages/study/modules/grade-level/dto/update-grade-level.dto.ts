import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateGradeLevelSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
});

export class UpdateGradeLevelDto extends createZodDto(UpdateGradeLevelSchema) {
    @ApiProperty({
        description: 'Name of the grade level',
        example: 'Grade 1',
        required: false,
    })
    name?: string;

    @ApiProperty({
        description: 'Description of the grade level',
        example: 'This is the first grade level in primary education.',
        required: false,
    })
    description?: string;
}
