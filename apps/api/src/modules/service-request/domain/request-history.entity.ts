import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ServiceRequestStatus } from '@companylab/contracts';
import { ServiceRequestEntity } from './service-request.entity';
import { EmployeeEntity } from '../../organization/domain/employee.entity';

@Entity('request_history')
@Index('ix_history_request_occurred', ['requestId', 'occurredAt'])
export class RequestHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text', unique: true, nullable: true })
  legacyId!: string | null;

  @Column({ type: 'uuid' })
  requestId!: string;

  @ManyToOne(() => ServiceRequestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request?: ServiceRequestEntity;

  @Column({ type: 'text', nullable: true })
  fromStatus!: ServiceRequestStatus | null;

  @Column({ type: 'text' })
  toStatus!: ServiceRequestStatus;

  @Column({ type: 'uuid' })
  actorId!: string;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'actor_id' })
  actor?: EmployeeEntity;

  @Column({ type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
