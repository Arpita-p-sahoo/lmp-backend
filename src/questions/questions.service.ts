import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, DataSource } from 'typeorm';
import { Question } from './entities/question.entity';
import { Vote } from './entities/vote.entity';
import { SavedQuestion } from './entities/saved-question.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsQueryDto } from './dto/questions-query.dto';
import { UserFollow } from '../users/entities/user-follow.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,

    @InjectRepository(Vote)
    private voteRepo: Repository<Vote>,

    @InjectRepository(SavedQuestion)
    private savedRepo: Repository<SavedQuestion>,

    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    // DataSource is needed for transactions
    private dataSource: DataSource,
  ) {}

  // ─── CREATE ───────────────────────────────────────────────
  async create(dto: CreateQuestionDto, authorId: string): Promise<Question> {
    const question = this.questionRepo.create({
      title: dto.title,
      techTag: dto.techTag,
      hashtags: dto.hashtags ?? [],
      authorId,
    });

    const saved = await this.questionRepo.save(question);

    // Increment user's questionsPosted counter
    await this.userRepo.increment({ id: authorId }, 'questionsPosted', 1);

    const created = await this.questionRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.author', 'author')
      .select([
        'q.id',
        'q.title',
        'q.techTag',
        'q.hashtags',
        'q.authorId',
        'q.voteCount',
        'q.commentCount',
        'q.isHot',
        'q.createdAt',
        'q.updatedAt',
        'author.id',
        'author.name',
        'author.avatarUrl',
        'author.designation',
      ])
      .where('q.id = :id', { id: saved.id })
      .getOne();

    if (!created) throw new NotFoundException('Question not found');
    return created;
  }

  // ─── GET FEED ─────────────────────────────────────────────
  async findAll(query: QuestionsQueryDto, userId?: string) {
    const { page, limit, techTag, sort } = query;
    const pageNumber = page ?? 1;
    const pageSize = limit ?? 20;
    const skip = (pageNumber - 1) * pageSize;

    // Build the base query
    const qb = this.questionRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.author', 'author')
      .select([
        'q.id',
        'q.title',
        'q.techTag',
        'q.hashtags',
        'q.voteCount',
        'q.commentCount',
        'q.isHot',
        'q.createdAt',
        'author.id',
        'author.name',
        'author.avatarUrl',
        'author.designation',
      ]);

    // Filter by tech tag if provided
    if (techTag) {
      qb.where('q.techTag = :techTag', { techTag });
    }

    // Sort order
    if (sort === 'hot') {
      qb.orderBy('q.voteCount', 'DESC');
    } else if (sort === 'top') {
      qb.orderBy('q.voteCount', 'DESC').addOrderBy('q.createdAt', 'DESC');
    } else {
      qb.orderBy('q.createdAt', 'DESC'); // 'new' is default
    }

    qb.skip(skip).take(pageSize);

    const [questions, total] = await qb.getManyAndCount();

    const questionIds = questions.map((q) => q.id);
    const commentCounts = new Map<string, number>();
    if (questionIds.length > 0) {
      const rows = await this.commentRepo
        .createQueryBuilder('c')
        .select('c.questionId', 'questionId')
        .addSelect('COUNT(*)', 'count')
        .where('c.questionId IN (:...ids)', { ids: questionIds })
        .groupBy('c.questionId')
        .getRawMany<{ questionId: string; count: string }>();

      rows.forEach((r) => commentCounts.set(r.questionId, Number(r.count)));
    }

    // If user is logged in, check which questions they voted/saved
    let votedIds = new Set<string>();
    let savedIds = new Set<string>();

    if (userId) {
      const votes = await this.voteRepo.find({ where: { userId } });
      const saves = await this.savedRepo.find({ where: { userId } });
      votedIds = new Set(votes.map((v) => v.questionId));
      savedIds = new Set(saves.map((s) => s.questionId));
    }

    // Attach isVoted and isSaved flags to each question
    const data = questions.map((q) => ({
      ...q,
      commentCount: commentCounts.get(q.id) ?? 0,
      isVoted: votedIds.has(q.id),
      isSaved: savedIds.has(q.id),
    }));

    return {
      data,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getFollowingFeed(query: QuestionsQueryDto, userId: string) {
    const { page, limit, techTag, sort } = query;
    const pageNumber = page ?? 1;
    const pageSize = limit ?? 20;
    const skip = (pageNumber - 1) * pageSize;

    const qb = this.questionRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.author', 'author')
      .select([
        'q.id',
        'q.title',
        'q.techTag',
        'q.hashtags',
        'q.voteCount',
        'q.commentCount',
        'q.isHot',
        'q.createdAt',
        'author.id',
        'author.name',
        'author.avatarUrl',
        'author.designation',
      ])
      .setParameter('userId', userId);

    const sub = qb
      .subQuery()
      .select('f.followingId')
      .from(UserFollow, 'f')
      .where('f.followerId = :userId')
      .getQuery();

    qb.where(
      new Brackets((b) => {
        b.where('q.authorId = :userId').orWhere(`q.authorId IN ${sub}`);
      }),
    );

    if (techTag) {
      qb.andWhere('q.techTag = :techTag', { techTag });
    }

    if (sort === 'hot') {
      qb.orderBy('q.voteCount', 'DESC');
    } else if (sort === 'top') {
      qb.orderBy('q.voteCount', 'DESC').addOrderBy('q.createdAt', 'DESC');
    } else {
      qb.orderBy('q.createdAt', 'DESC');
    }

    qb.skip(skip).take(pageSize);

    const [questions, total] = await qb.getManyAndCount();

    const questionIds = questions.map((q) => q.id);
    const commentCounts = new Map<string, number>();
    if (questionIds.length > 0) {
      const rows = await this.commentRepo
        .createQueryBuilder('c')
        .select('c.questionId', 'questionId')
        .addSelect('COUNT(*)', 'count')
        .where('c.questionId IN (:...ids)', { ids: questionIds })
        .groupBy('c.questionId')
        .getRawMany<{ questionId: string; count: string }>();

      rows.forEach((r) => commentCounts.set(r.questionId, Number(r.count)));
    }

    const votes = await this.voteRepo.find({ where: { userId } });
    const saves = await this.savedRepo.find({ where: { userId } });
    const votedIds = new Set(votes.map((v) => v.questionId));
    const savedIds = new Set(saves.map((s) => s.questionId));

    const data = questions.map((q) => ({
      ...q,
      commentCount: commentCounts.get(q.id) ?? 0,
      isVoted: votedIds.has(q.id),
      isSaved: savedIds.has(q.id),
    }));

    return {
      data,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ─── GET ONE ──────────────────────────────────────────────
  async findOne(id: string, userId?: string) {
    const question = await this.questionRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.author', 'author')
      .select([
        'q.id',
        'q.title',
        'q.techTag',
        'q.hashtags',
        'q.authorId',
        'q.voteCount',
        'q.commentCount',
        'q.isHot',
        'q.createdAt',
        'q.updatedAt',
        'author.id',
        'author.name',
        'author.avatarUrl',
        'author.designation',
      ])
      .where('q.id = :id', { id })
      .getOne();

    if (!question) throw new NotFoundException('Question not found');

    let isVoted = false;
    let isSaved = false;

    if (userId) {
      isVoted = !!(await this.voteRepo.findOne({
        where: { questionId: id, userId },
      }));
      isSaved = !!(await this.savedRepo.findOne({
        where: { questionId: id, userId },
      }));
    }

    const comments = await this.commentRepo
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
      .where('c.questionId = :questionId', { questionId: id })
      .orderBy('c.createdAt', 'ASC')
      .getMany();

    return {
      ...question,
      commentCount: comments.length,
      isVoted,
      isSaved,
      comments,
    };
  }

  // ─── UPDATE ───────────────────────────────────────────────
  async update(id: string, dto: Partial<CreateQuestionDto>, userId: string) {
    const question = await this.questionRepo.findOne({ where: { id } });

    if (!question) throw new NotFoundException('Question not found');

    // Only the author can edit
    if (question.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own questions');
    }

    Object.assign(question, dto);
    return this.questionRepo.save(question);
  }

  // ─── DELETE ───────────────────────────────────────────────
  async remove(id: string, userId: string) {
    const question = await this.questionRepo.findOne({ where: { id } });

    if (!question) throw new NotFoundException('Question not found');

    if (question.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own questions');
    }

    await this.questionRepo.remove(question);

    // Decrement user's questionsPosted counter
    await this.userRepo.decrement({ id: userId }, 'questionsPosted', 1);

    return { message: 'Question deleted' };
  }

  // ─── VOTE TOGGLE ──────────────────────────────────────────
  async toggleVote(questionId: string, userId: string) {
    // This entire operation runs in a transaction
    // If anything fails, ALL changes are rolled back
    return this.dataSource.transaction(async (manager) => {
      const question = await manager.findOne(Question, {
        where: { id: questionId },
      });

      if (!question) throw new NotFoundException('Question not found');

      const existing = await manager.findOne(Vote, {
        where: { questionId, userId },
      });

      if (existing) {
        // Already voted — remove the vote
        await manager.delete(Vote, { questionId, userId });
        await manager.decrement(Question, { id: questionId }, 'voteCount', 1);

        // Get authorId to decrement their totalVotes
        await manager.decrement(
          User,
          { id: question.authorId },
          'totalVotes',
          1,
        );

        return { voted: false, message: 'Vote removed' };
      } else {
        // Not voted yet — add the vote
        await manager.save(Vote, { questionId, userId });
        await manager.increment(Question, { id: questionId }, 'voteCount', 1);

        await manager.increment(
          User,
          { id: question.authorId },
          'totalVotes',
          1,
        );

        return { voted: true, message: 'Vote added' };
      }
    });
  }

  // ─── SAVE TOGGLE ──────────────────────────────────────────
  async toggleSave(questionId: string, userId: string) {
    const existing = await this.savedRepo.findOne({
      where: { questionId, userId },
    });

    if (existing) {
      await this.savedRepo.delete({ questionId, userId });
      return { saved: false, message: 'Removed from saved' };
    } else {
      await this.savedRepo.save({ questionId, userId });
      return { saved: true, message: 'Question saved' };
    }
  }

  // ─── SAVED QUESTIONS ──────────────────────────────────────
  async getSaved(userId: string) {
    const saved = await this.savedRepo.find({
      where: { userId },
      relations: ['question', 'question.author'],
      order: { createdAt: 'DESC' },
    });

    return saved.map((s) => ({
      ...s.question,
      isVoted: false,
      isSaved: true,
    }));
  }

  // ─── MY QUESTIONS ─────────────────────────────────────────
  async getMyQuestions(userId: string) {
    return this.questionRepo.find({
      where: { authorId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── SEARCH ───────────────────────────────────────────────
  async search(q: string) {
    const questions = await this.questionRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.author', 'author')
      .where(
        "to_tsvector('english', q.title) @@ plainto_tsquery('english', :q)",
        { q },
      )
      .orWhere('q.title ILIKE :like', { like: `%${q}%` })
      .orderBy('q.voteCount', 'DESC')
      .limit(20)
      .getMany();

    return questions;
  }
}
