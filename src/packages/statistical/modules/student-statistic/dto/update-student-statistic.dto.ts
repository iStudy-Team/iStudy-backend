import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";
import { CreateStudentStatisticDtoSchema } from "./create-student-statistic.dto";

export const UpdateStudentStatisticDtoSchema = CreateStudentStatisticDtoSchema.partial();

export class UpdateStudentStatisticDto extends createZodDto(UpdateStudentStatisticDtoSchema) {
    @ApiProperty({
        description: 'Year of the statistic',
        example: 2024,
        minimum: 2000,
        maximum: 2100,
        required: false
    })
    year?: number;

    @ApiProperty({
        description: 'Month of the statistic',
        example: 6,
        minimum: 1,
        maximum: 12,
        required: false
    })
    month?: number;

    @ApiProperty({
        description: 'Total number of students',
        example: 150,
        required: false
    })
    total_students?: number;

    @ApiProperty({
        description: 'Number of new students',
        example: 25,
        required: false
    })
    new_students?: number;

    @ApiProperty({
        description: 'Number of inactive students',
        example: 5,
        required: false
    })
    inactive_students?: number;
}
