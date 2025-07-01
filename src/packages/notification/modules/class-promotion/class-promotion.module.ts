import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/packages/auth/auth.module';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { ClassPromotionService } from './class-promotion.service';
import { ClassPromotionController } from './class-promotion.controller';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [PrismaService, GenerateIdService, ClassPromotionService],
    controllers: [ClassPromotionController],
    exports: [ClassPromotionService],
})
export class ClassPromotionModule {}
