import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';

@Injectable()
export class RelationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generateIdService: GenerateIdService
    ) {}

    async createRelation(createRelationDto: CreateRelationDto) {
        // Check if student exists
        const student = await this.prisma.student.findFirst({
            where: { id: createRelationDto.student_id },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Check if parent exists
        const parent = await this.prisma.parent.findFirst({
            where: { id: createRelationDto.parent_id },
        });

        if (!parent) {
            throw new NotFoundException('Parent not found');
        }

        // Check if relation already exists
        const existingRelation = await this.prisma.student_Parent_Relation.findFirst({
            where: {
                student_id: createRelationDto.student_id,
                parent_id: createRelationDto.parent_id,
            },
        });

        if (existingRelation) {
            throw new ConflictException('Relation already exists between this student and parent');
        }

        // If setting as primary, remove primary status from other relations for this student
        if (createRelationDto.is_primary) {
            await this.prisma.student_Parent_Relation.updateMany({
                where: {
                    student_id: createRelationDto.student_id,
                    is_primary: true,
                },
                data: {
                    is_primary: false,
                },
            });
        }

        try {
            const relation = await this.prisma.student_Parent_Relation.create({
                data: {
                    ...createRelationDto,
                    id: this.generateIdService.generateId(),
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                    parent: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                },
            });
            return relation;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create relation',
                error.message
            );
        }
    }

    async updateRelation(
        id: string,
        updateRelationDto: UpdateRelationDto,
        user: User
    ) {
        const relation = await this.prisma.student_Parent_Relation.findFirst({
            where: { id },
            include: {
                student: {
                    select: {
                        user_id: true,
                    },
                },
                parent: {
                    select: {
                        user_id: true,
                    },
                },
            },
        });

        if (!relation) {
            throw new NotFoundException('Relation not found');
        }

        // Check permission - only admin or the student/parent themselves can update
        if (
            user.role !== 4 &&
            relation.student.user_id !== user.id &&
            relation.parent.user_id !== user.id
        ) {
            throw new ForbiddenException('You do not have permission to update this relation');
        }

        // If setting as primary, remove primary status from other relations for this student
        if (updateRelationDto.is_primary) {
            await this.prisma.student_Parent_Relation.updateMany({
                where: {
                    student_id: relation.student_id,
                    is_primary: true,
                    id: { not: id },
                },
                data: {
                    is_primary: false,
                },
            });
        }

        try {
            const updatedRelation = await this.prisma.student_Parent_Relation.update({
                where: { id },
                data: updateRelationDto,
                include: {
                    student: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                    parent: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                },
            });
            return updatedRelation;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update relation',
                error.message
            );
        }
    }

    async getRelationById(id: string) {
        const relation = await this.prisma.student_Parent_Relation.findFirst({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        user: {
                            select: {
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
                parent: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true,
                        email: true,
                        relationship: true,
                        user: {
                            select: {
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!relation) {
            throw new NotFoundException('Relation not found');
        }

        return relation;
    }

    async deleteRelation(id: string, user: User) {
        const relation = await this.prisma.student_Parent_Relation.findFirst({
            where: { id },
            include: {
                student: {
                    select: {
                        user_id: true,
                    },
                },
                parent: {
                    select: {
                        user_id: true,
                    },
                },
            },
        });

        if (!relation) {
            throw new NotFoundException('Relation not found');
        }

        // Check permission - only admin or the student/parent themselves can delete
        if (
            user.role !== 4 &&
            relation.student.user_id !== user.id &&
            relation.parent.user_id !== user.id
        ) {
            throw new ForbiddenException(
                'You do not have permission to delete this relation'
            );
        }

        try {
            await this.prisma.student_Parent_Relation.delete({
                where: { id },
            });
            return { message: 'Relation deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to delete relation',
                error.message
            );
        }
    }

    async getAllRelations() {
        const relations = await this.prisma.student_Parent_Relation.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                parent: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true,
                        relationship: true,
                    },
                },
            },
        });

        if (relations.length === 0) {
            throw new NotFoundException('No relations found');
        }
        return relations;
    }

    async getRelationsByStudentId(studentId: string) {
        const relations = await this.prisma.student_Parent_Relation.findMany({
            where: { student_id: studentId },
            include: {
                parent: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true,
                        email: true,
                        relationship: true,
                        user: {
                            select: {
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (relations.length === 0) {
            throw new NotFoundException('No relations found for this student');
        }
        return relations;
    }

    async getRelationsByParentId(parentId: string) {
        const relations = await this.prisma.student_Parent_Relation.findMany({
            where: { parent_id: parentId },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        user: {
                            select: {
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (relations.length === 0) {
            throw new NotFoundException('No relations found for this parent');
        }
        return relations;
    }
}
