import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailModule } from 'src/mail/mail.module';

const isGoogleAuthEnabled =
  !!process.env.GOOGLE_CLIENT_ID &&
  !!process.env.GOOGLE_CLIENT_SECRET &&
  !!process.env.GOOGLE_CALLBACK_URL;

@Module({
  imports: [
    // Makes the User entity available for injection in this module
    TypeOrmModule.forFeature([User]),
    PassportModule,
    // Configure JWT with secret and expiry from .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.getOrThrow<string>('jwt.secret');
        type ExpiresIn = NonNullable<
          JwtModuleOptions['signOptions']
        >['expiresIn'];
        const expiresIn = configService.getOrThrow<string>(
          'jwt.expiresIn',
        ) as unknown as ExpiresIn;
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...(isGoogleAuthEnabled ? [GoogleStrategy] : [])],
})
export class AuthModule {}
