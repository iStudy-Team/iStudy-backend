import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { PasswordService } from 'src/common/services/password.services';
import { UploadService } from 'src/common/services/upload.service';
import { AuthModule } from 'src/packages/auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [UsersController],
    providers: [
        UsersService,
        PrismaService,
        GenerateIdService,
        PasswordService,
        UploadService,
    ],
    exports: [UsersService],
})
export class UsersModule {}
