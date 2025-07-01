import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateRelationSchema = z.object({
    student_id: z.string().min(1, 'Student ID is required'),
    parent_id: z.string().min(1, 'Parent ID is required'),
    is_primary: z.boolean().optional(),
});

export class CreateRelationDto extends createZodDto(CreateRelationSchema) {
    @ApiProperty({
        description: 'ID of the student',
        example: 'student_12345',
    })
    student_id: string;

    @ApiProperty({
        description: 'ID of the parent',
        example: 'parent_12345',
    })
    parent_id: string;

    @ApiProperty({
        description: 'Whether this is the primary parent relationship',
        example: true,
        required: false,
        default: false,
    })
    is_primary?: boolean;
}
