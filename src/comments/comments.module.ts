import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { CommentReaction } from './entities/comment.reaction.entity';
import { Question } from '../questions/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentReaction, Question])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
