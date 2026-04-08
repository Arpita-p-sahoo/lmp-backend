import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { JobsModule } from './jobs/jobs.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

// Redis cache manager
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Redis cache — available globally across all modules
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
          },
          ttl: 300,
        });
        return { store };
      },
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('database.url');
        const ssl = configService.get<boolean>('database.ssl');
        const sslRejectUnauthorized = configService.get<boolean>(
          'database.sslRejectUnauthorized',
        );
        const base = {
          type: 'postgres' as const,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          logging: true,
        };
        const sslOption = ssl
          ? { ssl: { rejectUnauthorized: !!sslRejectUnauthorized } }
          : {};
        if (url) {
          return {
            ...base,
            url,
            ...sslOption,
          };
        }
        return {
          ...base,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          ...sslOption,
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
    QuestionsModule,
    UsersModule,
    CommentsModule,
    JobsModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
