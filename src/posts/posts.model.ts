import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/users.model";

interface PostCreationAttrs {
    title: string;
    content: string;
    userId: number;
    image?: string; // Делаем необязательным, если может быть null
}

@Table({ tableName: 'posts' })
export class Post extends Model<Post, PostCreationAttrs> {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @ApiProperty({ example: 'Мой первый пост', description: 'Заголовок поста' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    title: string;

    @ApiProperty({ example: 'Содержимое моего первого поста', description: 'Текст поста' })
    @Column({ type: DataType.STRING, allowNull: false })
    content: string;

    @ApiProperty({ example: 'image.jpg', description: 'Изображение поста', required: false })
    @Column({ type: DataType.STRING, allowNull: true }) // Явно указываем allowNull: true
    image: string;

    @ApiProperty({ example: 1, description: 'ID автора поста' })
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false }) // Добавляем allowNull: false
    userId: number;

    @ApiProperty({ type: () => User, description: 'Автор поста' })
    @BelongsTo(() => User)
    author: User;
}