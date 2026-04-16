import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import type { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const rawState = req.query?.state;
    const state = typeof rawState === 'string' ? rawState : '';
    const mode = state === 'signup' ? 'signup' : 'login';

    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Google profile did not include an email address'));
      return;
    }

    const googleUser = {
      googleId: profile.id,
      email,
      name:
        `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim() ||
        profile.displayName ||
        email,
      avatarUrl: profile.photos?.[0]?.value ?? '',
      provider: 'google',
    };

    const user = await this.authService.findOrCreateGoogleUser(
      googleUser,
      mode,
    );
    done(null, user);
  }
}
