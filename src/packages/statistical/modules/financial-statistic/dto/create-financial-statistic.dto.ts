import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export const CreateFinancialStatisticDtoSchema = z.object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12),
    total_income: z.number().min(0).optional(),
    total_expenses: z.number().min(0).optional(),
    teacher_salaries: z.number().min(0).optional(),
    other_expenses: z.number().min(0).optional(),
    profit: z.number().optional(),
    total_discounts: z.number().min(0).optional(),
    unpaid_invoices: z.number().min(0).optional(),
});

export class CreateFinancialStatisticDto extends createZodDto(CreateFinancialStatisticDtoSchema) {
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
        description: 'Total income for the period',
        example: 150000.50,
        required: false,
        default: 0
    })
    total_income?: number;

    @ApiProperty({
        description: 'Total expenses for the period',
        example: 120000.25,
        required: false,
        default: 0
    })
    total_expenses?: number;

    @ApiProperty({
        description: 'Teacher salaries for the period',
        example: 80000.00,
        required: false,
        default: 0
    })
    teacher_salaries?: number;

    @ApiProperty({
        description: 'Other expenses for the period',
        example: 40000.25,
        required: false,
        default: 0
    })
    other_expenses?: number;

    @ApiProperty({
        description: 'Profit for the period (can be negative)',
        example: 30000.25,
        required: false,
        default: 0
    })
    profit?: number;

    @ApiProperty({
        description: 'Total discounts given',
        example: 5000.00,
        required: false,
        default: 0
    })
    total_discounts?: number;

    @ApiProperty({
        description: 'Total unpaid invoices',
        example: 15000.00,
        required: false,
        default: 0
    })
    unpaid_invoices?: number;
}
