import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        try {
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                throw new UnauthorizedException('Токен не предоставлен');
            }

            // ✅ Валидация токена с обработкой ошибок
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.PRIVATE_KEY || 'SECRET',
            });

            // ✅ Добавляем пользователя в запрос
            request['user'] = payload;

            return true;
        } catch (error) {
            this.logger.error(`JWT Auth Failed: ${error.message}`);

            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Срок действия токена истек');
            } else if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Неверный токен');
            } else if (error.name === 'NotBeforeError') {
                throw new UnauthorizedException('Токен еще не активен');
            }

            throw new UnauthorizedException('Пользователь не авторизован');
        }
    }

    // ✅ Метод для извлечения токена из заголовка
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}