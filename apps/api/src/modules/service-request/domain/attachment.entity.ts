import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ServiceRequestEntity } from './service-request.entity';

@Entity('attachment')
export class AttachmentEntity {
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

  @Column({ type: 'text' })
  driveFileId!: string;

  @Column({ type: 'text' })
  name!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
