import {
  Body,
  Controller,
  ExecutionContext,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

type GoogleAuthResult = {
  accessToken: string;
  user: unknown;
};

type GoogleAuthErrorRequest = Request & { googleAuthError?: string };

class GoogleLoginGuard extends AuthGuard('google') {
  getAuthenticateOptions() {
    return { scope: ['email', 'profile'], state: 'login' };
  }
}

class GoogleSignupGuard extends AuthGuard('google') {
  getAuthenticateOptions() {
    return { scope: ['email', 'profile'], state: 'signup' };
  }
}

class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser | null {
    const req = context.switchToHttp().getRequest<GoogleAuthErrorRequest>();
    const msg =
      (err as { message?: string } | null)?.message ??
      (info as { message?: string } | null)?.message ??
      'Google login failed';
    if (err || !user) {
      req.googleAuthError = msg;
      return null;
    }
    return user;
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(GoogleLoginGuard)
  @ApiOperation({ summary: 'Login with Google' })
  googleAuth() {
    return;
  }

  @Get('google/signup')
  @UseGuards(GoogleSignupGuard)
  @ApiOperation({ summary: 'Signup with Google' })
  googleSignup() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleCallback(
    @Req() req: GoogleAuthErrorRequest & { user?: GoogleAuthResult },
    @Res() res: Response,
  ) {
    const { accessToken } = req.user ?? {};
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';

    if (!accessToken) {
      const err = req.googleAuthError ?? 'Google login failed';
      return res.redirect(
        `${frontendUrl}/auth/google/callback?error=${encodeURIComponent(err)}`,
      );
    }

    return res.redirect(
      `${frontendUrl}/auth/google/callback?token=${accessToken}`,
    );
  }
}
