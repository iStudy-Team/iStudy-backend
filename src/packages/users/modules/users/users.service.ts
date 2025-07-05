import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { PasswordService } from 'src/common/services/password.services';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService,
        private readonly passwordService: PasswordService
    ) {}

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const { username, email, password, ...rest } = createUserDto;

        // Check if username already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingEmail = await this.prisma.user.findFirst({
                where: { email },
            });

            if (existingEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        // Hash password
        const hashedPassword = await this.passwordService.hashPassword(password);

        try {
            const user = await this.prisma.user.create({
                data: {
                    id: this.generateIdService.generateId(),
                    username,
                    email,
                    password: hashedPassword,
                    status: createUserDto.status ?? true,
                    ...rest,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                },
            });

            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new BadRequestException('Failed to create user');
        }
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{
        users: Omit<User, 'password'>[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc',
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                },
            }),
            this.prisma.user.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            users,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check if username is being updated and if it already exists
        if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
            const usernameExists = await this.prisma.user.findUnique({
                where: { username: updateUserDto.username },
            });

            if (usernameExists) {
                throw new ConflictException('Username already exists');
            }
        }

        // Check if email is being updated and if it already exists
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findFirst({
                where: {
                    email: updateUserDto.email,
                    NOT: { id },
                },
            });

            if (emailExists) {
                throw new ConflictException('Email already exists');
            }
        }

        try {
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: updateUserDto,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                },
            });

            return updatedUser;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new BadRequestException('Failed to update user');
        }
    }

    async remove(id: string): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        try {
            await this.prisma.user.delete({
                where: { id },
            });

            return { message: 'User deleted successfully' };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new BadRequestException('Failed to delete user');
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { email },
        });
    }

    async updateAvatar(id: string, avatarUrl: string): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        try {
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: { avatar: avatarUrl },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                },
            });

            return updatedUser;
        } catch (error) {
            console.error('Error updating user avatar:', error);
            throw new BadRequestException('Failed to update user avatar');
        }
    }
}
