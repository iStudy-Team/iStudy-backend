import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const RequestPasswordSchema = z.object({
    email: z.string().email().min(1, 'Email is required'),
});

export class RequestPasswordDto extends createZodDto(RequestPasswordSchema) {
    @ApiProperty({
        description: 'Email address of the user requesting password reset',
        example: 'example@example.com',
        type: String,
        required: true,
    })
    email: string;
}
