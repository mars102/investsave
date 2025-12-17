// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'user@mail.ru или crypto_trader', description: 'Email или username пользователя' })
    @IsString({ message: 'Должно быть строкой' })
    readonly login: string;

    @ApiProperty({ example: '12345678', description: 'Пароль' })
    @IsString({ message: 'Должно быть строкой' })
    @Length(4, 16, { message: 'Не меньше 4 и не больше 16 символов' })
    readonly password: string;
}