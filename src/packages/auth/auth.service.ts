import {
    Injectable,
    ConflictException,
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestPasswordDto } from './dto/send-email-forgot-password.dto';
import { PasswordService } from 'src/common/services/password.services';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GenerateIdService } from 'src/common/services/generate-id.services';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StudentService } from '../users/modules/students/student.service';
import { ParentService } from '../users/modules/parents/parent.service';
import { TeacherService } from '../users/modules/teachers/teacher.service';
import { MailService } from 'src/common/services/mail.services';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordServices: PasswordService,
        private readonly generateId: GenerateIdService,
        private readonly jwt: JwtService,
        private readonly studentService: StudentService,
        private readonly parentService: ParentService,
        private readonly teacherService: TeacherService,
        private readonly mailService: MailService
    ) {}

    async register(registerDto: RegisterDto) {
        try {
            const checkUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: registerDto.email },
                        { username: registerDto.username },
                    ],
                },
            });
            if (checkUser)
                throw new ConflictException(
                    'User with this email or username already exists'
                );

            const hashedPassword = await this.passwordServices.hashPassword(
                registerDto.password
            );

            const user = await this.prisma.user.create({
                data: {
                    ...registerDto,
                    password: hashedPassword,
                    id: this.generateId.generateId(),
                    status: true,
                },
            });

            if (user) {
                if (user.role === 2) {
                    await this.studentService.createStudent({
                        user_id: user.id,
                        full_name: user.username,
                        status: user.status ? 1 : 0,
                    });
                } else if (user.role === 3) {
                    await this.parentService.createParent({
                        user_id: user.id,
                        full_name: user.username,
                        status: user.status ? 1 : 0,
                    });
                } else if (user.role === 1) {
                    await this.teacherService.createTeacher({
                        user_id: user.id,
                        full_name: user.username,
                        status: user.status ? 1 : 0,
                    });
                }
            }

            return {
                message: 'User registered successfully',
            };
        } catch (err) {
            console.log('Errors login: ', err);
            throw new InternalServerErrorException(
                err.message || 'Registration failed'
            );
        }
    }

    async login(loginDto: LoginDto) {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: loginDto.credential },
                        { username: loginDto.credential },
                        { phone: loginDto.credential },
                    ],
                },
            });

            if (!user) {
                throw new BadRequestException(
                    'Email or phone or username invalid'
                );
            }

            const isPasswordValid =
                await this.passwordServices.comparePasswords(
                    loginDto.password,
                    user.password
                );

            if (!isPasswordValid) {
                throw new BadRequestException('Password is invalid');
            }

            const token = this.jwt.sign({ id: user.id });

            return {
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    status: user.status,
                    avatar: user.avatar,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                },
                token,
            };
        } catch (err) {
            console.log('Errors login: ', err);
            throw new InternalServerErrorException(
                err.message || 'Login failed'
            );
        }
    }

    async requestPasswordReset(dto: RequestPasswordDto) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { email: dto.email },
            });

            if (!user) {
                throw new NotFoundException(
                    'This email has not been registered with any account yet.'
                );
            }

            const generateOTP = (): string => {
                return Math.floor(100000 + Math.random() * 900000).toString();
            };

            const existingOtp =
                await this.prisma.password_Reset_Token.findFirst({
                    where: { user_id: user.id },
                });

            let otpCode: string;
            try {
                if (!existingOtp) {
                    const data = await this.prisma.password_Reset_Token.create({
                        data: {
                            id: this.generateId.generateId(),
                            user_id: user.id,
                            otp_code: generateOTP(),
                            expires_at: new Date(Date.now() + 10 * 60 * 1000),
                        },
                    });
                    otpCode = data.otp_code;
                } else {
                    const data = await this.prisma.password_Reset_Token.update({
                        where: { id: existingOtp.id },
                        data: {
                            otp_code: generateOTP(),
                            expires_at: new Date(Date.now() + 10 * 60 * 1000),
                        },
                    });
                    otpCode = data.otp_code;
                }
            } catch (err) {
                console.log('Error creating or updating OTP:', err);
                throw new InternalServerErrorException(
                    'Failed to create or update OTP for password reset'
                );
            }

            await this.mailService.sendMail(
                dto.email,
                'Mã OTP đặt lại mật khẩu',
                'forgot-password.template',
                {
                    username: user.username,
                    otp: otpCode,
                }
            );

            return { message: 'Password reset link sent to your email' };
        } catch (err) {
            console.log('Error requesting password reset:', err);
            throw new InternalServerErrorException(
                err.message || 'Failed to request password reset'
            );
        }
    }

    async verifyOtpAndResetPassword(dto: VerifyOtpDto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (!user) {
            throw new NotFoundException(
                'This email has not been registered with any account yet.'
            );
        }

        const passwordResetToken =
            await this.prisma.password_Reset_Token.findFirst({
                where: { user_id: user.id, otp_code: dto.otp },
            });

        if (!passwordResetToken) {
            throw new BadRequestException('Invalid OTP code');
        }
        // Check if OTP is expired (more than 10 minutes)
        const expiresAt = new Date(passwordResetToken.expires_at);
        const now = new Date();
        const diffMs = now.getTime() - expiresAt.getTime();
        if (diffMs > 10 * 60 * 1000) {
            throw new BadRequestException('OTP code has expired');
        }

        try {
            const hashedPassword = await this.passwordServices.hashPassword(
                dto.password
            );
            await this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });

            // Delete the OTP after successful password reset
            await this.prisma.password_Reset_Token.delete({
                where: { id: passwordResetToken.id },
            });

            return { message: 'Password reset successfully' };
        } catch (err) {
            console.log('Error resetting password:', err);
            throw new InternalServerErrorException(
                err.message || 'Failed to reset password'
            );
        }
    }
}
