import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { GradeLevelService } from './grade-level.service';
import { GradeLevelController } from './grade-level.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, GradeLevelService],
    controllers: [GradeLevelController],
    exports: [GradeLevelService],
})
export class GradeLevelModule {}
