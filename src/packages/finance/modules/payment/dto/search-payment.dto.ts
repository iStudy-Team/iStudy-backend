import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const SearchPaymentSchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
});

export class SearchPaymentsDto extends createZodDto(SearchPaymentSchema) {
    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        required: false,
    })
    page?: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        required: false,
    })
    limit?: number;
}
