import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question } from './entities/question.entity';
import { Vote } from './entities/vote.entity';
import { SavedQuestion } from './entities/saved-question.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Vote, SavedQuestion, User])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
