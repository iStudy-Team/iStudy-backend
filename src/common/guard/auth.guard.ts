import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid token');
        }

        const token = authHeader.replace('Bearer ', '').trim();

        if (!token) {
            throw new UnauthorizedException('Token is required');
        }

        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });

            request['user'] = decoded;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
