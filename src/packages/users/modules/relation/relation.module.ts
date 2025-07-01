import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { RelationService } from './relation.service';
import { RelationController } from './relation.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, GenerateIdService, RelationService],
    controllers: [RelationController],
    exports: [RelationService],
})
export class RelationModule {}
