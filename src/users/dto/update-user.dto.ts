import {ApiProperty} from "@nestjs/swagger";
import {IsString, IsEmail, Length, IsOptional, IsBoolean, IsJSON, IsUrl, IsIn} from "class-validator";

export class UpdateUserDto {
    @ApiProperty({example: 'new_username', description: 'Уникальное имя пользователя', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    @Length(3, 20, {message: 'Имя пользователя должно быть от 3 до 20 символов'})
    readonly username?: string;

    @ApiProperty({example: 'newuser@mail.ru', description: 'Почта', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    @IsEmail({}, {message: "Некорректный email"})
    readonly email?: string;

    @ApiProperty({example: 'Иван', description: 'Имя пользователя', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    @Length(1, 50, {message: 'Имя должно быть от 1 до 50 символов'})
    readonly firstName?: string;

    @ApiProperty({example: 'Петров', description: 'Фамилия пользователя', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    @Length(1, 50, {message: 'Фамилия должна быть от 1 до 50 символов'})
    readonly lastName?: string;

    @ApiProperty({example: 'https://example.com/new-avatar.jpg', description: 'URL аватара', required: false})
    @IsOptional()
    @IsUrl({}, {message: 'Некорректный URL'})
    readonly avatar?: string;

    @ApiProperty({example: 'EUR', description: 'Предпочитаемая валюта для отображения', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    @IsIn(['USD', 'EUR', 'RUB', 'GBP', 'JPY', 'CNY'], {message: 'Недопустимая валюта'})
    readonly preferredCurrency?: string;

    @ApiProperty({example: 'ru', description: 'Язык интерфейса', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    @IsIn(['en', 'ru', 'es', 'fr', 'de', 'zh'], {message: 'Недопустимый язык'})
    readonly language?: string;

    @ApiProperty({example: 'America/New_York', description: 'Часовой пояс пользователя', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    readonly timezone?: string;

    @ApiProperty({example: '{email: false, priceAlerts: true}', description: 'Настройки уведомлений в JSON', required: false})
    @IsOptional()
    @IsJSON({message: 'Должно быть валидным JSON'})
    readonly notificationSettings?: string;

    @ApiProperty({example: 'Professional cryptocurrency trader', description: 'Биография пользователя', required: false})
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    @Length(0, 500, {message: 'Биография не должна превышать 500 символов'})
    readonly bio?: string;

    @ApiProperty({example: true, description: 'Подтвержден ли email', required: false})
    @IsOptional()
    @IsBoolean({message: 'Должно быть булевым значением'})
    readonly emailVerified?: boolean;

    @ApiProperty({example: true, description: 'Включена ли двухфакторная аутентификация', required: false})
    @IsOptional()
    @IsBoolean({message: 'Должно быть булевым значением'})
    readonly twoFactorEnabled?: boolean;
}

export class UpdatePasswordDto {
    @ApiProperty({example: 'oldpassword123', description: 'Текущий пароль'})
    @IsString({message: 'Должно быть строкой'})
    readonly currentPassword: string;

    @ApiProperty({example: 'newpassword456', description: 'Новый пароль'})
    @IsString({message: 'Должно быть строкой'})
    @Length(6, 32, {message: 'Пароль должен быть от 6 до 32 символов'})
    readonly newPassword: string;
}

export class UpdateNotificationSettingsDto {
    @ApiProperty({example: '{email: true, priceAlerts: true, news: false}', description: 'Настройки уведомлений в JSON'})
    @IsJSON({message: 'Должно быть валидным JSON'})
    readonly notificationSettings: string;
}