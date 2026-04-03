import {
  Controller,
  ExecutionContext,
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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsQueryDto } from './dto/jobs-query.dto';
import type { Request as ExpressRequest } from 'express';

type JwtUser = { id: string; email: string };
type JwtRequest = ExpressRequest & { user?: JwtUser };
type JwtAuthedRequest = ExpressRequest & { user: JwtUser };

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

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get all job listings with optional filters' })
  findAll(@Query() query: JobsQueryDto, @Request() req: JwtRequest) {
    return this.jobsService.findAll(query, req.user?.id);
  }

  @Get('saved')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my saved jobs' })
  getSaved(@Request() req: JwtAuthedRequest) {
    return this.jobsService.getSaved(req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new job listing' })
  create(@Body() dto: CreateJobDto, @Request() req: JwtAuthedRequest) {
    return this.jobsService.create(dto, req.user.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get a single job listing' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: JwtRequest) {
    return this.jobsService.findOne(id, req.user?.id);
  }

  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle save on a job' })
  toggleSave(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: JwtAuthedRequest,
  ) {
    return this.jobsService.toggleSave(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete your job listing' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: JwtAuthedRequest,
  ) {
    return this.jobsService.remove(id, req.user.id);
  }
}
