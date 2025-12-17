import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { User } from "../users/users.model";

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    // Новый метод для входа с поддержкой email/username
    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto);
        return this.generateToken(user);
    }

    // Старый метод оставляем для обратной совместимости
    async loginWithEmail(userDto: CreateUserDto) {
        const user = await this.validateUser({
            login: userDto.email,
            password: userDto.password
        });
        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDto) {
        // Проверяем email
        const candidateByEmail = await this.userService.getUserByEmail(userDto.email);
        if (candidateByEmail) {
            throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
        }

        // Проверяем username
        const candidateByUsername = await this.userService.getUserByUsername(userDto.username);
        if (candidateByUsername) {
            throw new HttpException('Пользователь с таким username существует', HttpStatus.BAD_REQUEST);
        }

        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({
            ...userDto,
            password: hashPassword
        });
        return this.generateToken(user);
    }

    private async generateToken(user: User) {
        const payload = {
            email: user.email,
            username: user.username,
            id: user.id,
            roles: user.roles
        };
        return {
            token: this.jwtService.sign(payload)
        };
    }

    private async validateUser(loginDto: LoginDto): Promise<User> {
        // Ищем пользователя по login (email или username)
        const user = await this.userService.getUserByLogin(loginDto.login);

        if (!user) {
            throw new UnauthorizedException({ message: 'Пользователь не найден' });
        }

        // Проверяем пароль
        const passwordEquals = await bcrypt.compare(loginDto.password, user.password);

        if (!passwordEquals) {
            throw new UnauthorizedException({ message: 'Неверный пароль' });
        }

        return user;
    }
}