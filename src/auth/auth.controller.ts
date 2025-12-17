import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto'; // <-- Импортируем новый DTO
import { AuthService } from './auth.service';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Вход в систему (email или username)' })
    @ApiResponse({ status: 200, description: 'Токен доступа' })
    @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
    @Post('/login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiResponse({ status: 201, description: 'Пользователь зарегистрирован' })
    @ApiResponse({ status: 400, description: 'Пользователь уже существует' })
    @Post('/registration')
    async registration(@Body() userDto: CreateUserDto) {
        return this.authService.registration(userDto);
    }
}