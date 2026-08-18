import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    super({
      // Extract token from "Authorization: Bearer <token>" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject tokens that have expired
      ignoreExpiration: false,
      // The secret used to verify the token signature
      secretOrKey: secret,
    });
  }

  // This runs automatically after the token signature is verified
  // Whatever you return here gets attached to req.user
  async validate(payload: { sub: string; email: string }) {
    // A signature-valid token whose user no longer exists (e.g. account
    // deleted, or the DB was wiped) must not be treated as logged in.
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return {
      id: user.id,
      email: user.email,
    };
  }
}
