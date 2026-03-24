import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ name: 'tech_tag' })
  techTag: string;

  @Column({ type: 'text', array: true, default: [] })
  hashtags: string[];

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'vote_count', default: 0 })
  voteCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'is_hot', default: false })
  isHot: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
