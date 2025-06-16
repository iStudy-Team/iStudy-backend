import { string, z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const ResponseLoginSchema = z.object({
    user: z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        username: z.string().min(3).max(50),
        phone: z.string(),
        status: z.boolean(),
        avatar: z.boolean(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
    }),
    token: z.string().min(1, 'Token must not be empty'),
});

export class ResponseLoginUserDto {
    @ApiProperty({
        description: 'User ID',
        type: String,
        example: '684b410a418eba052ecdf512',
    })
    id: string;

    @ApiProperty({
        description: 'User email',
        type: String,
        example: 'example@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'User username',
        type: String,
        example: 'exampleUser',
    })
    username: string;

    @ApiProperty({
        description: 'User phone number',
        type: String,
        example: '0123456789',
    })
    phone: string;

    @ApiProperty({
        description: 'User status',
        type: Boolean,
        example: true,
    })
    status: boolean;

    @ApiProperty({
        description: 'User avatar url',
        type: Boolean,
        example: true,
    })
    avatar: boolean;

    @ApiProperty({
        description: 'User account creation date',
        type: String,
        example: '2023-10-01T12:00:00Z',
    })
    createdAt: string;

    @ApiProperty({
        description: 'User account update date',
        type: String,
        example: '2023-10-01T12:00:00Z',
    })
    updatedAt: string;
}

export class ResponseLoginDto extends createZodDto(ResponseLoginSchema) {
    @ApiProperty({
        description: 'User information',
        type: ResponseLoginUserDto,
    })
    user: ResponseLoginUserDto;

    @ApiProperty({
        description: 'Authentication token',
        type: String,
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    token: string;
}
