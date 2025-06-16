import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './packages/auth/auth.module';
import { UserModule } from './packages/users/user.module';
import { StudyModule } from './packages/study/study.module';

@Module({
    imports: [AuthModule, UserModule, StudyModule],
    providers: [PrismaService, AppService],
    controllers: [AppController],
})
export class AppModule {}
