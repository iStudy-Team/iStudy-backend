import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateRelationSchema = z.object({
    is_primary: z.boolean().optional(),
});

export class UpdateRelationDto extends createZodDto(UpdateRelationSchema) {
    @ApiProperty({
        description: 'Whether this is the primary parent relationship',
        example: true,
        required: false,
    })
    is_primary?: boolean;
}
