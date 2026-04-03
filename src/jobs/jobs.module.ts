import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, SavedJob])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
