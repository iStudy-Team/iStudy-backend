import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: 'user_123456789',
    })
    id: string;

    @ApiProperty({
        description: 'Username',
        example: 'johndoe',
    })
    username: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john@example.com',
    })
    email?: string;

    @ApiProperty({
        description: 'Phone number',
        example: '+1234567890',
    })
    phone?: string;

    @ApiProperty({
        description: 'Avatar image URL',
        example: 'https://example.com/avatar.jpg',
    })
    avatar?: string;

    @ApiProperty({
        description: 'User role (1=Admin, 2=Teacher, 3=Student, 4=Parent)',
        example: 3,
    })
    role: number;

    @ApiProperty({
        description: 'User status (active/inactive)',
        example: true,
    })
    status: boolean;

    @ApiProperty({
        description: 'Account creation date',
        example: '2025-07-04T21:48:16.000Z',
    })
    created_at: Date;

    @ApiProperty({
        description: 'Last update date',
        example: '2025-07-04T21:48:16.000Z',
    })
    updated_at: Date;
}
