import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UserFollow } from './entities/user-follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserFollow]), CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // exported so other modules can use it later
})
export class UsersModule {}
