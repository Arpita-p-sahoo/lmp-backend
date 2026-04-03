import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsQueryDto } from './dto/jobs-query.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,

    @InjectRepository(SavedJob)
    private savedJobRepo: Repository<SavedJob>,
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
  async findAll(query: JobsQueryDto, userId?: string) {
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

    let savedIds = new Set<string>();
    if (userId && jobs.length > 0) {
      const saved = await this.savedJobRepo.find({
        where: {
          userId,
          jobId: In(jobs.map((j) => j.id)),
        },
      });
      savedIds = new Set(saved.map((s) => s.jobId));
    }

    return {
      data: jobs.map((j) => ({
        ...j,
        isSaved: savedIds.has(j.id),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── GET ONE JOB ──────────────────────────────────────────
  async findOne(id: string, userId?: string) {
    const job = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.poster', 'poster')
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
      .where('job.id = :id', { id })
      .getOne();

    if (!job) throw new NotFoundException('Job not found');

    let isSaved = false;
    if (userId) {
      isSaved = !!(await this.savedJobRepo.findOne({
        where: { jobId: id, userId },
      }));
    }

    return {
      ...job,
      isSaved,
    };
  }

  // ─── SAVE TOGGLE ──────────────────────────────────────────
  async toggleSave(jobId: string, userId: string) {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const existing = await this.savedJobRepo.findOne({
      where: { jobId, userId },
    });

    if (existing) {
      await this.savedJobRepo.delete({ jobId, userId });
      return { saved: false, message: 'Removed from saved' };
    }

    await this.savedJobRepo.save({ jobId, userId });
    return { saved: true, message: 'Job saved' };
  }

  // ─── SAVED JOBS ───────────────────────────────────────────
  async getSaved(userId: string) {
    const saved = await this.savedJobRepo.find({
      where: { userId },
      relations: ['job', 'job.poster'],
      order: { createdAt: 'DESC' },
    });

    return saved.map((s) => ({
      ...s.job,
      isSaved: true,
    }));
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
