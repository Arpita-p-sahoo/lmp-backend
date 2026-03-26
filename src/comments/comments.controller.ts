import {
  Controller,
  Get,
  Post,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReactCommentDto } from './dto/react-comment.dto';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
    email: string;
  };
}

class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    return (user as TUser) || (null as TUser);
  }
}

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post('questions/:id/comments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a question' })
  create(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.commentsService.create(questionId, dto, req.user!.id);
  }

  @Get('questions/:id/comments')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get comments for a question' })
  findByQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Query('sort') sort: 'top' | 'new' = 'top',
    @Request() req: AuthenticatedRequest,
  ) {
    return this.commentsService.findByQuestion(questionId, sort, req.user?.id);
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.commentsService.remove(id, req.user!.id);
  }

  @Post('comments/:id/react')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or dislike a comment' })
  react(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReactCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.commentsService.react(id, dto, req.user!.id);
  }
}
