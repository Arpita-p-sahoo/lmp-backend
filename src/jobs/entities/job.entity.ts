import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column({ nullable: true })
  location: string;

  // Only 3 allowed values — enforced at DB level
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  type: 'Remote' | 'Hybrid' | 'Onsite';

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  salary: string;

  @Column({ type: 'text', array: true, default: [] })
  techStack: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'posted_by' })
  postedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'posted_by' })
  poster: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
