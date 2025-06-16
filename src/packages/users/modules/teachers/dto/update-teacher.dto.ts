import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { GenderEnum, StatusEnum } from 'src/packages/users/types/user.types';

export const UpdateTeacherSchema = z.object({
    full_name: z.string().min(3).max(100).trim().optional(),
    gender: z.number().int().min(0).max(2).optional(),
    date_of_birth: z
        .string()
        .optional()
        .refine(
            (date) => {
                if (!date) return true;
                const isoRegex =
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
                return isoRegex.test(date) && !isNaN(Date.parse(date));
            },
            {
                message:
                    'Date must be a valid ISO string (e.g., 2023-01-01T00:00:00.000Z)',
            }
        ),
    address: z.string().min(3).optional(),
    qualification: z.string().min(3).optional(),
    hire_date: z
        .string()
        .optional()
        .refine(
            (date) => {
                if (!date) return true;
                const isoRegex =
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
                return isoRegex.test(date) && !isNaN(Date.parse(date));
            },
            {
                message:
                    'Hire date must be a valid ISO string (e.g., 2023-01-01T00:00:00.000Z)',
            }
        ),
    zalo_id: z.string().optional(),
    facebook_id: z.string().optional(),
    status: z.number().min(0).max(1).optional(),
});

export class UpdateTeacherDto extends createZodDto(UpdateTeacherSchema) {
    @ApiProperty({
        description: 'Full name of the teacher',
        example: 'John Doe',
        required: false,
    })
    full_name?: string;

    @ApiProperty({
        description: 'Gender of the teacher (0 = MALE, 1 = FEMALE, 2 = OTHER)',
        example: GenderEnum.MALE,
        enum: GenderEnum,
        enumName: 'GenderEnum',
        required: false,
    })
    gender?: GenderEnum;
    @ApiProperty({
        description: 'Date of birth of the teacher in ISO format',
        example: '1980-01-01T00:00:00.000Z',
        required: false,
    })
    date_of_birth?: string;
    @ApiProperty({
        description: 'Address of the teacher',
        example: '123 Main St, City, Country',
        required: false,
    })
    address?: string;
    @ApiProperty({
        description: 'Qualification of the teacher',
        example: 'Master of Education',
        required: false,
    })
    qualification?: string;
    @ApiProperty({
        description: 'Hire date of the teacher in ISO format',
        example: '2023-01-01T00:00:00.000Z',
        required: false,
    })
    hire_date?: string;
    @ApiProperty({
        description: 'Zalo ID of the teacher',
        example: 'zalo_12345',
        required: false,
    })
    zalo_id?: string;
    @ApiProperty({
        description: 'Facebook ID of the teacher',
        example: 'facebook_12345',
        required: false,
    })
    facebook_id?: string;
    @ApiProperty({
        description: 'Status of the teacher (0 = INACTIVE, 1 = ACTIVE)',
        example: StatusEnum.ACTIVE,
        enum: StatusEnum,
        enumName: 'StatusEnum',
        required: false,
    })
    status?: StatusEnum;
}
