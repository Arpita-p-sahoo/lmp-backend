import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const baseDir = __dirname.replace(/\\/g, '/');

export default new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
  ...(process.env.DB_SSL === 'true' ||
  (process.env.DATABASE_URL ?? '').includes('sslmode=require')
    ? {
        ssl: {
          rejectUnauthorized:
            (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? '').toLowerCase() ===
            'true',
        },
      }
    : {}),
  entities: [`${baseDir}/../**/*.entity{.ts,.js}`],
  migrations: [`${baseDir}/migrations/*{.ts,.js}`],
});
