import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsPhoneNumber, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        description: 'Username',
        example: 'johndoe',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    username?: string;

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
        description: 'User status (active/inactive)',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    status?: boolean;
}
