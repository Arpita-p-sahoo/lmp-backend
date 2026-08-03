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
import { redisInsStore } from 'cache-manager-ioredis-yet';
import { MailModule } from './mail/mail.module';
import { GeminiModule } from './gemini/gemini.module';
import Redis from 'ioredis';

const isMailEnabled = (process.env.ENABLE_MAIL ?? '').toLowerCase() !== 'false';
const isGeminiEnabled =
  (process.env.ENABLE_GEMINI ?? '').toLowerCase() === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('redis.host');
        const port = configService.get<number>('redis.port') ?? 6379;
        const password = configService.get<string>('redis.password');

        if (!host) return {};

        const client = new Redis({
          host,
          port,
          password: password || undefined,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          connectTimeout: 1000,
          retryStrategy: () => null,
        });

        client.on('error', () => undefined);

        const connected = await Promise.race([
          client
            .connect()
            .then(() => true)
            .catch(() => false),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)),
        ]);
        if (!connected) {
          await client.quit().catch(() => undefined);
          return {};
        }

        const store = redisInsStore(client);
        return { store, ttl: 300 };
      },
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = (process.env.NODE_ENV ?? '').toLowerCase();
        const isProd = nodeEnv === 'production';
        const isTest = nodeEnv === 'test';

        const url = configService.get<string>('database.url');
        const ssl = configService.get<boolean>('database.ssl');
        const sslRejectUnauthorized = configService.get<boolean>(
          'database.sslRejectUnauthorized',
        );
        const base = {
          type: 'postgres' as const,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isTest,
          dropSchema: isTest,
          logging: isTest ? false : !isProd,
          retryAttempts: 1,
          retryDelay: 1000,
          extra: {
            connectionTimeoutMillis: 1500,
          },
        };
        if (isTest) {
          const testUrl = process.env.DATABASE_URL_TEST ?? url;
          if (testUrl) {
            return {
              ...base,
              url: testUrl,
              ssl: false,
            };
          }
          return {
            ...base,
            host: configService.get<string>('database.host'),
            port: configService.get<number>('database.port'),
            username: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.name'),
            ssl: false,
          };
        }
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
    ...(isMailEnabled ? [MailModule] : []),
    ...(isGeminiEnabled ? [GeminiModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
