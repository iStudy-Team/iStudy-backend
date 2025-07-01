import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";
import { CreateFinancialStatisticDtoSchema } from "./create-financial-statistic.dto";

export const UpdateFinancialStatisticDtoSchema = CreateFinancialStatisticDtoSchema.partial();

export class UpdateFinancialStatisticDto extends createZodDto(UpdateFinancialStatisticDtoSchema) {
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
        description: 'Total income for the period',
        example: 150000.50,
        required: false
    })
    total_income?: number;

    @ApiProperty({
        description: 'Total expenses for the period',
        example: 120000.25,
        required: false
    })
    total_expenses?: number;

    @ApiProperty({
        description: 'Teacher salaries for the period',
        example: 80000.00,
        required: false
    })
    teacher_salaries?: number;

    @ApiProperty({
        description: 'Other expenses for the period',
        example: 40000.25,
        required: false
    })
    other_expenses?: number;

    @ApiProperty({
        description: 'Profit for the period (can be negative)',
        example: 30000.25,
        required: false
    })
    profit?: number;

    @ApiProperty({
        description: 'Total discounts given',
        example: 5000.00,
        required: false
    })
    total_discounts?: number;

    @ApiProperty({
        description: 'Total unpaid invoices',
        example: 15000.00,
        required: false
    })
    unpaid_invoices?: number;
}
