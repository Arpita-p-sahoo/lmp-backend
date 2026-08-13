import {
  Controller,
  ExecutionContext,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsQueryDto } from './dto/questions-query.dto';
import type { Request as ExpressRequest } from 'express';

type JwtUser = { id: string; email: string };
type JwtRequest = ExpressRequest & { user?: JwtUser };
type JwtAuthedRequest = ExpressRequest & { user: JwtUser };

// A small helper guard we'll reuse — tries JWT but doesn't fail if missing
class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtUser | null>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
  ): TUser {
    void _info;
    void _context;
    if (err) return null as TUser;
    return user ?? (null as TUser);
  }
}

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get('following')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get question feed from users I follow' })
  getFollowingFeed(
    @Query() query: QuestionsQueryDto,
    @Request() req: JwtAuthedRequest,
  ) {
    return this.questionsService.getFollowingFeed(query, req.user.id);
  }

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get paginated question feed' })
  findAll(@Query() query: QuestionsQueryDto, @Request() req: JwtRequest) {
    return this.questionsService.findAll(query, req.user?.id);
  }

  @Get('saved')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my saved questions' })
  getSaved(@Request() req: JwtAuthedRequest) {
    return this.questionsService.getSaved(req.user.id);
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my posted questions' })
  getMyQuestions(@Request() req: JwtAuthedRequest) {
    return this.questionsService.getMyQuestions(req.user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search questions' })
  search(@Query('q') q: string) {
    return this.questionsService.search(q);
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get single question' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: JwtRequest) {
    return this.questionsService.findOne(id, req.user?.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a question' })
  create(@Body() dto: CreateQuestionDto, @Request() req: JwtAuthedRequest) {
    return this.questionsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a question' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateQuestionDto,
    @Request() req: JwtAuthedRequest,
  ) {
    return this.questionsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a question' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: JwtAuthedRequest,
  ) {
    return this.questionsService.remove(id, req.user.id);
  }

  @Post(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle vote on a question' })
  toggleVote(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: JwtAuthedRequest,
  ) {
    return this.questionsService.toggleVote(id, req.user.id);
  }

  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle save on a question' })
  toggleSave(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: JwtAuthedRequest,
  ) {
    return this.questionsService.toggleSave(id, req.user.id);
  }
}
