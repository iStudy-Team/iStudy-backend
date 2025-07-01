import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './packages/auth/auth.module';
import { UserModule } from './packages/users/user.module';
import { StudyModule } from './packages/study/study.module';
import { FinanceModule } from './packages/finance/finance.module';
import { NotificationModule } from './packages/notification/notification.module';
import { StatisticalModule } from './packages/statistical/statistical.module';
import { ActivityModule } from './packages/activity/activity.module';

@Module({
    imports: [AuthModule, UserModule, StudyModule, FinanceModule, NotificationModule, StatisticalModule, ActivityModule],
    providers: [PrismaService, AppService],
    controllers: [AppController],
})
export class AppModule {}
