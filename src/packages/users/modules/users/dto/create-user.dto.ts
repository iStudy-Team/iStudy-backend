import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'Username',
        example: 'johndoe',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    username: string;

    @ApiProperty({
        description: 'Password',
        example: 'password123',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john@example.com',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        description: 'Phone number',
        example: '+1234567890',
        required: false,
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        description: 'Avatar image URL',
        example: 'https://example.com/avatar.jpg',
        required: false,
    })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({
        description: 'User role (1=Admin, 2=Teacher, 3=Student, 4=Parent)',
        example: 3,
    })
    @IsNotEmpty()
    @IsNumber()
    role: number;

    @ApiProperty({
        description: 'User status (active/inactive)',
        example: true,
        required: false,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    status?: boolean;
}
