import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, GenerateIdService, ParentService],
    controllers: [ParentController],
    exports: [ParentService],
})
export class ParentModule {}
