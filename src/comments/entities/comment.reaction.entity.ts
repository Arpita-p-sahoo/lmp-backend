import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

@Entity('comment_reactions')
export class CommentReaction {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'comment_id' })
  commentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  // 'like' or 'dislike' — enforced at DB level with CHECK constraint
  @Column({ type: 'varchar', length: 10 })
  type: 'like' | 'dislike';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
