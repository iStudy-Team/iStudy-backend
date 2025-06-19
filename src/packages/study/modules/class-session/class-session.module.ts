import { Module } from '@nestjs/common';
import { AuthModule } from 'src/packages/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ClassSessionService } from './class-session.service';
import { ClassSessionController } from './class-session.controller';

@Module({
    imports: [AuthModule],
    providers: [PrismaService, GenerateIdService, ClassSessionService],
    exports: [ClassSessionService],
    controllers: [ClassSessionController],
})
export class ClassSessionModule {}
