import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const VerifyOtpSchema = z.object({
    email: z.string().email().min(1, 'Email is required'),
    otp: z.string().min(6, 'OTP must be at least 6 characters long'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) {
    @ApiProperty({
        description: 'Email address of the user',
        example: 'example@example.com',
        required: true,
    })
    email: string;
    @ApiProperty({
        description: 'One-time password for verification',
        example: '123456',
        required: true,
    })
    otp: string;
    @ApiProperty({
        description: 'New password to set after OTP verification',
        example: 'newPassword123',
        required: true,
    })
    password: string;
}
