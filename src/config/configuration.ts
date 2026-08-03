export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 33,
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    ssl:
      (process.env.DB_SSL ?? '').toLowerCase() === 'true' ||
      (process.env.DATABASE_URL ?? '').includes('sslmode=require'),
    sslRejectUnauthorized:
      (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? '').toLowerCase() === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '', 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  frontendUrl:
    ((process.env.NODE_ENV ?? '').toLowerCase() === 'production'
      ? process.env.FRONTEND_URL_PROD
      : process.env.FRONTEND_URL_LOCAL) ?? process.env.FRONTEND_URL,
});
