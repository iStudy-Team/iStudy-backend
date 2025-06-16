import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const LoginSchema = z.object({
    credential: z
        .string()
        .min(3, 'Email, phone or username is required')
        .max(50)
        .trim(),
    password: z.string().min(6, 'Password is required').max(100).trim(),
});

export class LoginDto extends createZodDto(LoginSchema) {
    @ApiProperty({
        description: 'Email, phone or username of the user',
        example: 'john_doe',
    })
    credential: string;

    @ApiProperty({
        description: 'Password of the user',
        example: 'password123',
    })
    password: string;
}
