import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UserRegisterDto } from 'src/auth/dto/UserRegisterDto';
import * as bcrypt from 'bcrypt';
import { changePasswordDto } from 'src/auth/dto/ChangePasswordDto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async register(userData: UserRegisterDto) {
        const existingUser = await this.findOneByEmail(userData.email);
        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser = this.usersRepository.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            age: userData.age,
        });

        return await this.usersRepository.save(newUser);
    }

    async findAll() {
        return this.usersRepository.find();
    }

    async findOneById(id: number) {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findOneByEmail(email: string) {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findCompleteProfileByEmail(email: string) {
        return this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .addSelect('user.accessToken')
            .where('user.email = :email', { email })
            .getOne();
    }

    async setAccessToken(email: string, accessToken: string) {
        await this.usersRepository.update({ email }, { accessToken });
    }

    async removeAccessToken(email: string) {
        await this.usersRepository.update({ email }, { accessToken: null });
    }

    async getUserProfile(email: string) {
        const user = await this.findOneByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return user;
    }

    async changePassword(email: string, body: changePasswordDto) {
        const user = await this.findCompleteProfileByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (body.newPassword !== body.confirmNewPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        const isOldPasswordValid = await bcrypt.compare(body.oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new BadRequestException('Old password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(body.newPassword, 10);
        user.password = hashedPassword;
        user.accessToken = null;

        try {
            return await this.usersRepository.save(user);
        } catch (error) {
            throw new InternalServerErrorException('Failed to change password');
        }
    }

}

