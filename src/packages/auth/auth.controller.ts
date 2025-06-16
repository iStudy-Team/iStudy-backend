import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseLoginDto } from './dto/response-login.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiExtraModels,
} from '@nestjs/swagger';
import { RequestPasswordDto } from './dto/send-email-forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Auth')
@ApiExtraModels(RegisterDto)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
    })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
        type: ResponseLoginDto,
    })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Request password reset' })
    @ApiResponse({
        status: 200,
        description: 'Password reset link sent to email',
    })
    @Post('forgot-password')
    async forgotPassword(@Body() dto: RequestPasswordDto) {
        return this.authService.requestPasswordReset(dto);
    }

    @ApiOperation({ summary: 'Verify OTP and reset password' })
    @ApiResponse({
        status: 200,
        description: 'Password successfully reset',
    })
    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyOtpAndResetPassword(verifyOtpDto);
    }
}
