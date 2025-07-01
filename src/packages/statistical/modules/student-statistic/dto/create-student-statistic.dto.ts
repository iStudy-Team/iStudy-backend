import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export const CreateStudentStatisticDtoSchema = z.object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12),
    total_students: z.number().int().min(0).optional(),
    new_students: z.number().int().min(0).optional(),
    inactive_students: z.number().int().min(0).optional(),
});

export class CreateStudentStatisticDto extends createZodDto(CreateStudentStatisticDtoSchema) {
    @ApiProperty({
        description: 'Year of the statistic',
        example: 2024,
        minimum: 2000,
        maximum: 2100
    })
    year: number;

    @ApiProperty({
        description: 'Month of the statistic',
        example: 6,
        minimum: 1,
        maximum: 12
    })
    month: number;

    @ApiProperty({
        description: 'Total number of students',
        example: 150,
        required: false,
        default: 0
    })
    total_students?: number;

    @ApiProperty({
        description: 'Number of new students',
        example: 25,
        required: false,
        default: 0
    })
    new_students?: number;

    @ApiProperty({
        description: 'Number of inactive students',
        example: 5,
        required: false,
        default: 0
    })
    inactive_students?: number;
}
