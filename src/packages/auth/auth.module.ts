import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordService } from 'src/common/services/password.services';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { StudentModule } from '../users/modules/students/student.module';
import { ParentModule } from '../users/modules/parents/parent.module';
import { TeacherModule } from '../users/modules/teachers/teacher.module';
import { MailService } from 'src/common/services/mail.services';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '30d' },
        }),
        StudentModule,
        ParentModule,
        TeacherModule,
    ],
    providers: [
        PrismaService,
        PasswordService,
        GenerateIdService,
        AuthService,
        AuthGuard,
        MailService,
    ],
    controllers: [AuthController],
    exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
