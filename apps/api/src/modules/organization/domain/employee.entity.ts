import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '@companylab/contracts';

@Entity('employee')
export class EmployeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text', unique: true, nullable: true })
  legacyId!: string | null;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  department!: string;

  @Column({
    type: 'text',
    default: UserRole.EMPLOYEE,
  })
  role!: UserRole;

  @Index({ unique: true })
  @Column({ type: 'text', unique: true })
  email!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
