import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateParentSchema = z.object({
    full_name: z.string().min(3, 'Full name is required').optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    status: z.number().optional(),
    address: z.string().min(3).optional(),
    relationship: z.string().min(1, 'Relationship is required').optional(),
    zalo_id: z.string().optional(),
    facebook_id: z.string().optional(),
})

export class UpdateParentDto extends createZodDto(UpdateParentSchema) {
    @ApiProperty({
        description: 'Full name of the parent',
        example: 'John Doe',
        required: false,
    })
    full_name?: string;

    @ApiProperty({
        description: 'Phone number of the parent',
        example: '+1234567890',
        required: false,
    })
    phone?: string;

    @ApiProperty({
        description: 'Email address of the parent',
        example: 'example@example.com',
        required: false,
    })
    email?: string;
    @ApiProperty({
        description: 'Status of the parent (1 for active, 0 for inactive)',
        example: 1,
        required: false,
    })
    status?: number;
    @ApiProperty({
        description: 'Address of the parent',
        example: '123 Main St, City, Country',
        required: false,
    })
    address?: string;
    @ApiProperty({
        description: 'Relationship of the parent to the student',
        example: 'Father',
    })
    relationship: string;
    @ApiProperty({
        description: 'Zalo ID of the parent',
        example: 'zalo_12345',
        required: false,
    })
    zalo_id?: string;
    @ApiProperty({
        description: 'Facebook ID of the parent',
        example: 'facebook_12345',
        required: false,
    })
    facebook_id?: string;
}
