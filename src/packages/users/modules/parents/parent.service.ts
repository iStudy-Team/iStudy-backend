import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createParent(createParentDto: CreateParentDto) {
        const existingParent = await this.prisma.parent.findFirst({
            where: { user_id: createParentDto.user_id },
        });

        if (existingParent) {
            throw new ConflictException('Parent already exists for this user');
        }

        try {
            const parent = await this.prisma.parent.create({
                data: {
                    ...createParentDto,
                    id: this.generateIdService.generateId(),
                },
            });
            return parent;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create parent',
                error.message
            );
        }
    }

    async updateParent(
        id: string,
        updateParentDto: UpdateParentDto,
        user: User
    ) {
        const parent = await this.prisma.parent.findFirst({
            where: { id },
        });

        if (!parent) {
            throw new NotFoundException('Parent not found');
        }

        if (parent.user_id !== user.id && user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to update this parent'
            );
        }

        try {
            const updatedParent = await this.prisma.parent.update({
                where: { id },
                data: updateParentDto,
            });
            return updatedParent;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update parent',
                error.message
            );
        }
    }

    async getParentById(id: string) {
        const parent = await this.prisma.parent.findFirst({
            where: { user_id: id },
        });

        if (!parent) {
            throw new NotFoundException('Parent not found');
        }

        return parent;
    }

    async deleteParent(id: string, user: User) {
        const parent = await this.prisma.parent.findFirst({
            where: { id },
        });

        if (!parent) {
            throw new NotFoundException('Parent not found');
        }

        if (parent.user_id !== user.id && user.role !== 4) {
            throw new ForbiddenException(
                'You do not have permission to delete this parent'
            );
        }

        try {
            await this.prisma.parent.delete({
                where: { id },
            });
            return { message: 'Parent deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete parent',
                error.message
            );
        }
    }

    async getAllParents() {
        const parents = await this.prisma.parent.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        username: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });
        if (parents.length === 0) {
            throw new NotFoundException('No parents found');
        }
        return parents;
    }
}
