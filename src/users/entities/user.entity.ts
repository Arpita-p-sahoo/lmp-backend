import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true })
  organisation: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  highestEducation: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ type: 'smallint', nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ type: 'text', array: true, default: [] })
  techStack: string[];

  @Column({ default: 0 })
  streak: number;

  @Column({ type: 'date', nullable: true })
  lastActive: string;

  @Column({ default: 0 })
  questionsPosted: number;

  @Column({ default: 0 })
  totalVotes: number;

  @Column({ unique: true, nullable: true })
  googleId: string;

  @Column({ default: 'local' })
  provider: string;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
