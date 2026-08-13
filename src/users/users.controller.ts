import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  NotFoundException,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request as ExpressRequest } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (test only)' })
  getAllUsers() {
    if ((process.env.NODE_ENV ?? '').toLowerCase() === 'production') {
      throw new NotFoundException();
    }
    return this.usersService.getAllUsersForTest();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile' })
  getMe(@Request() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  updateMe(@Body() dto: UpdateUserDto, @Request() req: AuthenticatedRequest) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  @Get('me/following')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users I follow' })
  getMyFollowing(@Request() req: AuthenticatedRequest) {
    return this.usersService.getFollowing(req.user.id);
  }

  @Get('me/followers')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my followers' })
  getMyFollowers(@Request() req: AuthenticatedRequest) {
    return this.usersService.getFollowers(req.user.id);
  }

  @Post(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  followUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.followUser(req.user.id, id);
  }

  @Delete(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a user' })
  unfollowUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.unfollowUser(req.user.id, id);
  }

  @Get(':id/following')
  @ApiOperation({ summary: "Get a user's following list" })
  getUserFollowing(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getFollowing(id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: "Get a user's followers list" })
  getUserFollowers(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getFollowers(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get public profile of any user' })
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getPublicProfile(id);
  }

  // 👇 NEW — Upload avatar
  @Post('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 1. Upload to Cloudinary → get URL
    const avatarUrl = await this.cloudinaryService.uploadImage(file, 'avatars');

    // 2. Save URL to user in DB
    await this.usersService.updateMe(req.user.id, { avatarUrl });

    return { avatarUrl };
  }

  // 👇 NEW — Upload banner
  @Post('me/banner')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile banner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadBanner(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 1. Upload to Cloudinary → get URL
    let bannerUrl: string;
    try {
      bannerUrl = await this.cloudinaryService.uploadImage(file, 'banners');
    } catch {
      throw new BadRequestException('Failed to upload banner image');
    }

    // 2. Save URL to user in DB
    await this.usersService.updateMe(req.user.id, { bannerUrl });

    return { bannerUrl };
  }
}
