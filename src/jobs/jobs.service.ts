import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsQueryDto } from './dto/jobs-query.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,
  ) {}

  // ─── CREATE JOB ───────────────────────────────────────────
  async create(dto: CreateJobDto, userId: string): Promise<Job> {
    const job = this.jobRepo.create({
      ...dto,
      postedBy: userId,
    });
    return this.jobRepo.save(job);
  }

  // ─── GET ALL JOBS WITH FILTERS ────────────────────────────
  async findAll(query: JobsQueryDto) {
    const { type, techTag, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoin('job.poster', 'poster')
      .select([
        'job.id',
        'job.title',
        'job.company',
        'job.location',
        'job.type',
        'job.experience',
        'job.salary',
        'job.techStack',
        'job.description',
        'job.createdAt',
        'poster.id',
        'poster.name',
        'poster.avatarUrl',
        'poster.designation',
      ])
      .orderBy('job.createdAt', 'DESC');

    // Filter by job type if provided
    if (type) {
      qb.andWhere('job.type = :type', { type });
    }

    // Filter by tech stack if provided
    // Uses PostgreSQL array contains operator @>
    if (techTag) {
      qb.andWhere('job.techStack @> ARRAY[:techTag]', { techTag });
    }

    qb.skip(skip).take(limit);

    const [jobs, total] = await qb.getManyAndCount();

    return {
      data: jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── GET ONE JOB ──────────────────────────────────────────
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['poster'],
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  // ─── DELETE JOB ───────────────────────────────────────────
  async remove(id: string, userId: string) {
    const job = await this.jobRepo.findOne({ where: { id } });

    if (!job) throw new NotFoundException('Job not found');

    // Only the person who posted can delete it
    if (job.postedBy !== userId) {
      throw new ForbiddenException('You can only delete your own job listings');
    }

    await this.jobRepo.remove(job);
    return { message: 'Job listing deleted' };
  }
}
