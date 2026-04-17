/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFollow } from './entities/user-follow.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(UserFollow)
        private userFollowRepo: Repository<UserFollow>,
    ) { }

    private toPublicUser(user: User): Pick<
        User,
        | 'id'
        | 'email'
        | 'name'
        | 'avatarUrl'
        | 'designation'
        | 'organisation'
        | 'techStack'
        | 'streak'
        | 'questionsPosted'
        | 'totalVotes'
        | 'createdAt'
    > {
        return {
            id: user.id,
            email: user.email,
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

    async getAllUsersForTest(): Promise<
        Array<
            Pick<
                User,
                | 'id'
                | 'email'
                | 'name'
                | 'avatarUrl'
                | 'designation'
                | 'organisation'
                | 'techStack'
                | 'streak'
                | 'questionsPosted'
                | 'totalVotes'
                | 'createdAt'
            >
        >
    > {
        const users = await this.userRepo
            .createQueryBuilder('u')
            .select([
                'u.id',
                'u.email',
                'u.name',
                'u.avatarUrl',
                'u.designation',
                'u.organisation',
                'u.techStack',
                'u.streak',
                'u.questionsPosted',
                'u.totalVotes',
                'u.createdAt',
            ])
            .orderBy('u.createdAt', 'DESC')
            .limit(200)
            .getMany();

        return users;
    }

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
        return this.toPublicUser(user);
    }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        const target = await this.userRepo.findOne({ where: { id: followingId } });
        if (!target) throw new NotFoundException('User not found');

        const exists = await this.userFollowRepo.findOne({
            where: { followerId, followingId },
        });
        if (exists) throw new ConflictException('Already following');

        await this.userFollowRepo.save(
            this.userFollowRepo.create({ followerId, followingId }),
        );

        return { followingId, isFollowing: true };
    }

    async unfollowUser(followerId: string, followingId: string) {
        await this.userFollowRepo.delete({ followerId, followingId });
        return { followingId, isFollowing: false };
    }

    async getFollowing(userId: string) {
        const users = await this.userRepo
            .createQueryBuilder('u')
            .innerJoin(UserFollow, 'f', 'f.followingId = u.id AND f.followerId = :userId', { userId })
            .select([
                'u.id',
                'u.email',
                'u.name',
                'u.avatarUrl',
                'u.designation',
                'u.organisation',
                'u.techStack',
                'u.streak',
                'u.questionsPosted',
                'u.totalVotes',
                'u.createdAt',
            ])
            .orderBy('f.createdAt', 'DESC')
            .getMany();

        return users;
    }

    async getFollowers(userId: string) {
        const users = await this.userRepo
            .createQueryBuilder('u')
            .innerJoin(UserFollow, 'f', 'f.followerId = u.id AND f.followingId = :userId', { userId })
            .select([
                'u.id',
                'u.email',
                'u.name',
                'u.avatarUrl',
                'u.designation',
                'u.organisation',
                'u.techStack',
                'u.streak',
                'u.questionsPosted',
                'u.totalVotes',
                'u.createdAt',
            ])
            .orderBy('f.createdAt', 'DESC')
            .getMany();

        return users;
    }
}
