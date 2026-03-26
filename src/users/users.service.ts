/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    // Get current logged in user's full profile
    async getMe(userId: string): Promise<Partial<User>> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException('User not found');

        // Never return the password hash to the frontend
        const { passwordHash, googleId, ...safe } = user;
        void passwordHash;
        void googleId;
        return safe;
    }

    // Update current user's profile
    async updateMe(userId: string, dto: UpdateUserDto): Promise<Partial<User>> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException('User not found');

        // Only update fields that were actually sent
        // If a field is not in dto, it stays unchanged
        Object.assign(user, dto);

        const updated = await this.userRepo.save(user);

        const { passwordHash, googleId, ...safe } = updated;
        void passwordHash;
        void googleId;
        return safe;
    }

    // Get any user's public profile by their id
    async getPublicProfile(userId: string): Promise<Partial<User>> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException('User not found');

        // Public profile shows less info than your own profile
        return {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            designation: user.designation,
            organisation: user.organisation,
            techStack: user.techStack,
            streak: user.streak,
            questionsPosted: user.questionsPosted,
            totalVotes: user.totalVotes,
            createdAt: user.createdAt,
        };
    }
}
