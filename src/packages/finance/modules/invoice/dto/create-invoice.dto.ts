import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatusEnum } from 'src/packages/finance/types/invoice';

export const CreateInvoiceSchema = z.object({
    student_id: z.string().min(1, {
        message: 'Student ID is required',
    }),
    class_id: z.string().min(1, {
        message: 'Class ID is required',
    }),
    invoice_number: z.string().min(1, {
        message: 'Invoice number is required',
    }),
    month: z.number().min(2, {
        message: 'Month is required',
    }),
    year: z.number().min(4, {
        message: 'Year is required',
    }),
    amount: z.number().min(0, {
        message: 'Amount must be a positive number',
    }),
    discount_amount: z
        .number()
        .min(0, {
            message: 'Discount amount must be a positive number',
        })
        .optional(),
    final_amount: z
        .number()
        .min(0, {
            message: 'Final amount must be a positive number',
        })
        .optional(),
    issue_date: z
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
        )
        .optional(),
    due_date: z
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
        )
        .optional(),
    status: z.nativeEnum(InvoiceStatusEnum).optional(),
    description: z
        .string()
        .min(1, {
            message: 'Description is required',
        })
        .optional(),
});

export class CreateInvoiceDto extends createZodDto(CreateInvoiceSchema) {
    @ApiProperty({
        description: 'ID of the student',
        type: String,
    })
    student_id: string;

    @ApiProperty({
        description: 'ID of the class',
        type: String,
    })
    class_id: string;

    @ApiProperty({
        description: 'Unique invoice number',
        type: String,
    })
    invoice_number: string;

    @ApiProperty({
        description: 'Month of the invoice',
        type: Number,
    })
    month: number;

    @ApiProperty({
        description: 'Year of the invoice',
        type: Number,
    })
    year: number;

    @ApiProperty({
        description: 'Total amount of the invoice',
        type: Number,
    })
    amount: number;

    @ApiProperty({
        description: 'Discount amount applied to the invoice',
        type: Number,
        required: false,
    })
    discount_amount?: number;

    @ApiProperty({
        description: 'Final amount after discounts',
        type: Number,
        required: false,
    })
    final_amount?: number;

    @ApiProperty({
        description: 'Issue date of the invoice in ISO format',
        type: String,
        required: false,
    })
    issue_date?: string;

    @ApiProperty({
        description: 'Due date of the invoice in ISO format',
        type: String,
        required: false,
    })
    due_date?: string;

    @ApiProperty({
        description: 'Status of the invoice',
        enum: InvoiceStatusEnum,
        required: false,
    })
    status?: InvoiceStatusEnum;

    @ApiProperty({
        description: 'Description of the invoice',
        type: String,
        required: false,
    })
    description?: string;
}
