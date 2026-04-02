import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentReaction } from './entities/comment.reaction.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentReaction)
    private readonly reactionRepo: Repository<CommentReaction>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  async findByQuestion(
    questionId: string,
    sort: 'top' | 'new' = 'top',
    userId?: string,
  ) {
    const qb = this.commentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.author', 'author')
      .select([
        'c.id',
        'c.questionId',
        'c.authorId',
        'c.text',
        'c.likeCount',
        'c.dislikeCount',
        'c.createdAt',
        'author.id',
        'author.name',
        'author.avatarUrl',
        'author.designation',
      ])
      .where('c.questionId = :questionId', { questionId });

    if (sort === 'top') {
      qb.orderBy('c.likeCount', 'DESC').addOrderBy('c.createdAt', 'DESC');
    } else {
      qb.orderBy('c.createdAt', 'DESC');
    }

    // Optionally annotate each comment with the current user's reaction
    const comments = await qb.getMany();
    if (userId) {
      const ids = comments.map((c) => c.id);
      if (ids.length > 0) {
        const reactions = await this.reactionRepo.find({
          where: ids.map((id) => ({ commentId: id, userId })),
        });
        const map = new Map(reactions.map((r) => [r.commentId, r.type]));
        // Attach a non-persisted property for convenience
        const commentsWithReaction = comments as Array<
          Comment & { myReaction?: 'like' | 'dislike' }
        >;
        commentsWithReaction.forEach((c) => {
          const t = map.get(c.id);
          if (t) c.myReaction = t;
        });
      }
    }
    return comments;
  }

  async create(questionId: string, dto: CreateCommentDto, userId: string) {
    return this.commentRepo.manager.transaction(async (em) => {
      const questions = em.getRepository(Question);
      const comments = em.getRepository(Comment);

      const question = await questions.findOne({ where: { id: questionId } });
      if (!question) throw new NotFoundException('Question not found');

      const saved = await comments.save(
        comments.create({
          questionId,
          authorId: userId,
          text: dto.text,
        }),
      );

      await questions.increment({ id: questionId }, 'commentCount', 1);

      const comment = await comments
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.author', 'author')
        .select([
          'c.id',
          'c.questionId',
          'c.authorId',
          'c.text',
          'c.likeCount',
          'c.dislikeCount',
          'c.createdAt',
          'author.id',
          'author.name',
          'author.avatarUrl',
          'author.designation',
        ])
        .where('c.id = :id', { id: saved.id })
        .getOne();

      if (!comment) throw new NotFoundException('Comment not found');
      return comment;
    });
  }

  async remove(id: string, userId: string) {
    return this.commentRepo.manager.transaction(async (em) => {
      const comments = em.getRepository(Comment);
      const questions = em.getRepository(Question);

      const existing = await comments.findOne({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Comment not found');
      }
      if (existing.authorId !== userId) {
        throw new ForbiddenException('You can only delete your own comment');
      }

      await comments.delete({ id });
      await questions.decrement({ id: existing.questionId }, 'commentCount', 1);

      return { deleted: true };
    });
  }

  async react(id: string, dto: { type: 'like' | 'dislike' }, userId: string) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentRepo.manager.transaction(async (em) => {
      const reactions = em.getRepository(CommentReaction);
      const comments = em.getRepository(Comment);

      const existing = await reactions.findOne({
        where: { commentId: id, userId },
      });

      let likeCount = comment.likeCount;
      let dislikeCount = comment.dislikeCount;
      let finalType: 'like' | 'dislike' | null = null;

      if (!existing) {
        await reactions.save(
          reactions.create({ commentId: id, userId, type: dto.type }),
        );
        if (dto.type === 'like') likeCount += 1;
        else dislikeCount += 1;
        finalType = dto.type;
      } else if (existing.type === dto.type) {
        await reactions.delete({ commentId: id, userId });
        if (dto.type === 'like') likeCount -= 1;
        else dislikeCount -= 1;
        finalType = null;
      } else {
        await reactions.save({ commentId: id, userId, type: dto.type });
        if (dto.type === 'like') {
          likeCount += 1;
          dislikeCount -= 1;
        } else {
          dislikeCount += 1;
          likeCount -= 1;
        }
        finalType = dto.type;
      }

      if (likeCount < 0) likeCount = 0;
      if (dislikeCount < 0) dislikeCount = 0;

      await comments.update(
        { id },
        { likeCount: likeCount, dislikeCount: dislikeCount },
      );

      return {
        type: finalType,
        likeCount,
        dislikeCount,
      };
    });
  }
}
