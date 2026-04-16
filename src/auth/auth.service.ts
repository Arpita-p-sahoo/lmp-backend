import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  public async signup(user: SignupDto) {
    const existing = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(user.password, 12);
    const created = await this.userRepository.save(
      this.userRepository.create({
        email: user.email,
        passwordHash,
        name: user.name,
        avatarUrl: user.avatarUrl,
        designation: user.designation,
        organisation: user.organisation,
        experience: user.experience,
        age: user.age,
        gender: user.gender,
        dob: user.dob,
        linkedinUrl: user.linkedinUrl,
        techStack: user.techStack,
      }),
    );
    const accessToken = await this.jwtService.signAsync({
      sub: created.id,
      email: created.email,
    });

    return {
      accessToken,
      user: {
        id: created.id,
        email: created.email,
        name: created.name,
        avatarUrl: created.avatarUrl,
        designation: created.designation,
        organisation: created.organisation,
        experience: created.experience,
        age: created.age,
        gender: created.gender,
        dob: created.dob,
        linkedinUrl: created.linkedinUrl,
        techStack: created.techStack,
        streak: created.streak,
        lastActive: created.lastActive,
        questionsPosted: created.questionsPosted,
        totalVotes: created.totalVotes,
        googleId: created.googleId,
        isVerified: created.isVerified,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    };
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    // Same error for "not found" and "wrong password"
    // Never tell attackers which one failed
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Compare password against stored hash
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate JWT token
    const token = this.generateToken(user);

    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  async findOrCreateGoogleUser(
    googleUser: {
      googleId: string;
      email: string;
      name: string;
      avatarUrl: string;
      provider: string;
    },
    mode: 'login' | 'signup' = 'login',
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const userByGoogleId = await this.userRepository.findOne({
      where: { googleId: googleUser.googleId },
    });

    if (userByGoogleId) {
      return {
        accessToken: this.generateToken(userByGoogleId),
        user: this.sanitizeUser(userByGoogleId),
      };
    }

    if (mode === 'login') {
      throw new UnauthorizedException(
        'Google account not registered. Please sign up with Google first.',
      );
    }

    const userByEmail = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (userByEmail) {
      if (userByEmail.provider !== 'google') {
        throw new ConflictException(
          'Email already registered. Please login using email and password.',
        );
      }
      userByEmail.googleId = googleUser.googleId;
      userByEmail.avatarUrl = googleUser.avatarUrl;
      const saved = await this.userRepository.save(userByEmail);
      return {
        accessToken: this.generateToken(saved),
        user: this.sanitizeUser(saved),
      };
    }

    const newUser = this.userRepository.create({
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.avatarUrl,
      googleId: googleUser.googleId,
      provider: 'google',
      techStack: [], // default empty array
    });

    const saved = await this.userRepository.save(newUser);

    return {
      accessToken: this.generateToken(saved),
      user: this.sanitizeUser(saved),
    };
  }

  // Generates a JWT token containing userId and email
  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id, // "sub" is JWT standard for subject (who this token is about)
      email: user.email,
    });
  }

  // Strips sensitive fields before sending user data to frontend
  private sanitizeUser(user: User) {
    const { passwordHash, googleId, ...safe } = user;
    void passwordHash;
    void googleId;
    return safe;
  }
}
