import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {User} from "./users.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService) {}

    async createUser(dto: CreateUserDto) {
        // Проверяем существование пользователя по email и username
        const existingUserByEmail = await this.getUserByEmail(dto.email);
        if (existingUserByEmail) {
            throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
        }

        const existingUserByUsername = await this.getUserByUsername(dto.username);
        if (existingUserByUsername) {
            throw new HttpException('Пользователь с таким именем уже существует', HttpStatus.BAD_REQUEST);
        }

        const user = await this.userRepository.create(dto);

        // По умолчанию назначаем роль USER, а не ADMIN
        const role = await this.roleService.getRoleByValue("USER");
        if (!role) {
            throw new HttpException('Роль USER не найдена в системе', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await user.$set('roles', [role.id]);
        user.roles = [role];
        return user;
    }

    async getAllUsers() {
        const users = await this.userRepository.findAll({
            include: {all: true},
            attributes: {exclude: ['password', 'twoFactorSecret']} // Исключаем чувствительные данные
        });
        return users;
    }

    async getUserByLogin(login: string): Promise<User | null> {
        // Проверяем, является ли login email'ом (содержит @)
        const isEmail = login.includes('@');

        const user = await this.userRepository.findOne({
            where: isEmail
                ? { email: login }
                : { username: login },
            include: { all: true }, // Чтобы загрузить роли
        });

        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: {email},
            include: {all: true}
        });
        return user;
    }

    async getUserByUsername(username: string) {
        const user = await this.userRepository.findOne({
            where: {username},
            include: {all: true}
        });
        return user;
    }

    async getUserById(id: number) {
        const user = await this.userRepository.findByPk(id, {
            include: {all: true},
            attributes: {exclude: ['password', 'twoFactorSecret']}
        });
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async updateUser(id: number, dto: UpdateUserDto) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        // Проверяем уникальность email, если он меняется
        if (dto.email && dto.email !== user.email) {
            const existingUser = await this.getUserByEmail(dto.email);
            if (existingUser) {
                throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
            }
        }

        // Проверяем уникальность username, если он меняется
        if (dto.username && dto.username !== user.username) {
            const existingUser = await this.getUserByUsername(dto.username);
            if (existingUser) {
                throw new HttpException('Пользователь с таким именем уже существует', HttpStatus.BAD_REQUEST);
            }
        }

        await user.update(dto);

        // Возвращаем обновленного пользователя без чувствительных данных
        const updatedUser = await this.userRepository.findByPk(id, {
            attributes: {exclude: ['password', 'twoFactorSecret']}
        });

        return updatedUser;
    }

    async verifyEmail(id: number) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        user.emailVerified = true;
        await user.save();
        return {message: 'Email успешно подтвержден'};
    }

    async updateLastLogin(id: number) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        user.lastLoginAt = new Date();
        await user.save();
        return user;
    }

    async updateTwoFactorSecret(id: number, secret: string) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        user.twoFactorSecret = secret;
        user.twoFactorEnabled = true;
        await user.save();
        return {message: 'Двухфакторная аутентификация активирована'};
    }

    async disableTwoFactorAuth(id: number) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await user.save();
        return {message: 'Двухфакторная аутентификация отключена'};
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);

        if (!role || !user) {
            throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
        }

        // Проверяем, есть ли уже такая роль у пользователя
        const hasRole = await user.$has('roles', role.id);
        if (hasRole) {
            throw new HttpException('У пользователя уже есть эта роль', HttpStatus.BAD_REQUEST);
        }

        await user.$add('roles', role.id);
        return {message: `Роль ${dto.value} успешно добавлена пользователю`};
    }

    async removeRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);

        if (!role || !user) {
            throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
        }

        await user.$remove('roles', role.id);
        return {message: `Роль ${dto.value} успешно удалена у пользователя`};
    }

    async ban(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        if (user.banned) {
            throw new HttpException('Пользователь уже забанен', HttpStatus.BAD_REQUEST);
        }

        user.banned = true;
        user.banReason = dto.banReason;
        await user.save();
        return user;
    }

    async unban(userId: number) {
        const user = await this.userRepository.findByPk(userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        if (!user.banned) {
            throw new HttpException('Пользователь не забанен', HttpStatus.BAD_REQUEST);
        }

        user.banned = false;
        user.banReason = null;
        await user.save();
        return {message: 'Пользователь разбанен'};
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findByPk(id);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        await user.destroy();
        return {message: 'Пользователь успешно удален'};
    }

    async getUserProfile(id: number) {
        const user = await this.userRepository.findByPk(id, {
            attributes: {exclude: ['password', 'twoFactorSecret']},
            include: {all: true}
        });

        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        return user;
    }
}