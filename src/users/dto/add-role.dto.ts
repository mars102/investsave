import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsString} from "class-validator";

export class AddRoleDto {
    @ApiProperty({example: '1', description: 'ID пользователя'})
    @IsNumber({}, {message: 'Должно быть числом'})
    readonly userId: number;

    @ApiProperty({example: 'ADMIN', description: 'Значение роли'})
    @IsString({message: 'Должно быть строкой'})
    readonly value: string;
}