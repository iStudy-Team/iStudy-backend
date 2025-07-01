import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export const CreateActivityLogDtoSchema = z.object({
    user_id: z.string().min(1, "User ID is required"),
    action: z.string().min(1, "Action is required").max(255, "Action must be less than 255 characters"),
    entity_type: z.string().max(100, "Entity type must be less than 100 characters").optional(),
    details: z.string().optional(),
    ip_address: z.string().max(45, "IP address must be less than 45 characters").optional(),
    user_agent: z.string().optional(),
});

export class CreateActivityLogDto extends createZodDto(CreateActivityLogDtoSchema) {
    @ApiProperty({
        description: 'ID of the user performing the action',
        example: 'user_123456',
    })
    user_id: string;

    @ApiProperty({
        description: 'Action performed by the user',
        example: 'LOGIN',
        maxLength: 255
    })
    action: string;

    @ApiProperty({
        description: 'Type of entity the action was performed on',
        example: 'USER',
        required: false,
        maxLength: 100
    })
    entity_type?: string;

    @ApiProperty({
        description: 'Additional details about the action',
        example: 'User logged in successfully from mobile app',
        required: false
    })
    details?: string;

    @ApiProperty({
        description: 'IP address of the user',
        example: '192.168.1.1',
        required: false,
        maxLength: 45
    })
    ip_address?: string;

    @ApiProperty({
        description: 'User agent string from the browser/app',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        required: false
    })
    user_agent?: string;
}
