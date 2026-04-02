import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from '../users/entities/user.entity';

// Cache key — consistent string we use to store/retrieve leaderboard
const LEADERBOARD_KEY = 'leaderboard:global';

// Cache TTL — 5 minutes in milliseconds
const LEADERBOARD_TTL = 5 * 60 * 1000;

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    // Inject the cache manager
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getLeaderboard() {
    // Step 1 — check Redis first
    const cached = await this.cacheManager.get(LEADERBOARD_KEY);

    if (cached) {
      // Cache HIT — return immediately, no DB query
      console.log('Leaderboard served from cache');
      return cached;
    }

    // Step 2 — Cache MISS — query PostgreSQL
    console.log('Leaderboard fetched from database');
    const users = await this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.avatarUrl',
        'user.designation',
        'user.organisation',
        'user.techStack',
        'user.totalVotes',
        'user.questionsPosted',
        'user.streak',
      ])
      .where('user.totalVotes > 0')
      .orderBy('user.totalVotes', 'DESC')
      .limit(50)
      .getMany();

    // Add rank number to each user
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

    // Step 3 — Store in Redis for 5 minutes
    await this.cacheManager.set(LEADERBOARD_KEY, leaderboard, LEADERBOARD_TTL);

    return leaderboard;
  }
}
