import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreatePaymentSchema = z.object({
    invoice_id: z
        .string()
        .min(1, 'Invoice ID must be at least 1 character long'),
    payment_date: z
        .string()
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
        .default(() => new Date().toISOString()),
    amount: z.number().min(0, 'Amount must be a positive number'),
    reference_number: z.string().optional(),
    received_by: z
        .string()
        .min(1, 'Received by must be at least 1 character long'),
    notes: z.string().optional(),
});

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {
    @ApiProperty({
        description: 'Unique identifier for the invoice',
        example: 'INV-123456',
    })
    invoice_id: string;

    @ApiProperty({
        description: 'Date of the payment in ISO format',
        example: '2023-01-01T00:00:00.000Z',
    })
    payment_date: string;

    @ApiProperty({
        description: 'Amount paid for the invoice',
        example: 100.0,
    })
    amount: number;

    @ApiProperty({
        description: 'Reference number for the payment',
        example: 'REF-78910',
        required: false,
    })
    reference_number?: string;

    @ApiProperty({
        description: 'Name of the person who received the payment',
        example: 'John Doe',
    })
    received_by: string;

    @ApiProperty({
        description: 'Additional notes regarding the payment',
        example: 'Payment received via bank transfer.',
        required: false,
    })
    notes?: string;
}
