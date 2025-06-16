import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";
import { GenderEnum, StatusEnum } from 'src/packages/users/types/user.types';

export const CreateStudentDtoSchema = z.object({
    user_id: z.string().min(1, "User ID is required"),
    full_name: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
    gender: z.number().min(0).max(2).optional(),
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
    enrollment_date: z
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
        status: z.number().min(0).max(1).optional(),
        discount_percentage: z
        .number()
        .min(0, "Discount percentage must be at least 0")
        .max(100, "Discount percentage must be at most 100")
        .multipleOf(0.01, "Discount percentage must have at most two decimal places")
        .optional(),
        discount_reason: z.string().max(255).optional(),
})


export class CreateStudentDto extends createZodDto(CreateStudentDtoSchema) {
    @ApiProperty({
        description: 'User ID associated with the student',
        example: 'user_12345',
    })
    user_id: string;

    @ApiProperty({
        description: 'Full name of the student',
        example: 'John Doe',
    })
    full_name: string;

    @ApiProperty({
        description: 'Gender of the teacher (0 = MALE, 1 = FEMALE, 2 = OTHER)',
        example: GenderEnum.MALE,
        enum: GenderEnum,
        enumName: 'GenderEnum',
        required: false,
    })
    gender?: GenderEnum;
    @ApiProperty({
        description: 'Date of birth of the student in ISO format',
        example: '2000-01-01T00:00:00.000Z',
        required: false,
    })
    date_of_birth?: string;
    @ApiProperty({
        description: 'Address of the student',
        example: '123 Main St, City, Country',
        required: false,
    })
    address?: string;
    @ApiProperty({
        description: 'Enrollment date of the student in ISO format',
        example: '2023-01-01T00:00:00.000Z',
        required: false,
    })
    enrollment_date?: string;
    @ApiProperty({
        description: 'Status of the student (0 = INACTIVE, 1 = ACTIVE)',
        example: StatusEnum.ACTIVE,
        enum: StatusEnum,
        enumName: 'StatusEnum',
        required: false,
    })
    status?: StatusEnum;
    @ApiProperty({
        description: 'Discount percentage for the student',
        example: 10.00,
        required: false,
    })
    discount_percentage?: number;
    @ApiProperty({
        description: 'Reason for the discount',
        example: 'Early registration discount',
        required: false,
    })
    discount_reason?: string;
}
