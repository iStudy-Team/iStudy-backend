import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";

export const RegisterSchema = z.object({
    username: z.string().min(3).max(20).trim(),
    password: z.string().min(6).max(100).trim(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    role: z.number().int().min(0).max(4),
})

export class RegisterDto extends createZodDto(RegisterSchema) {
    @ApiProperty({
        description: "Username of the user",
        example: "john_doe",
    })
    username: string;

    @ApiProperty({
        description: "Password of the user",
        example: "password123",
    })
    password: string;

    @ApiProperty({
        description: "Email of the user",
        example: "",
        required: false,
    })
    email?: string;
    @ApiProperty({
        description: "Phone number of the user",
        example: "",
        required: false,
    })
    phone?: string;
    @ApiProperty({
        description: "Avatar URL of the user",
        example: "",
        required: false,
    })
    avatar?: string;
    @ApiProperty({
        description: "Role of the user (0: User, 1: Teacher, 2: Student, 3: Parent, 4: Admin)",
        example: 0,
        required: false,
    })
    role: number;
}
