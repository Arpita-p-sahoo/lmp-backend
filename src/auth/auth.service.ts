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
