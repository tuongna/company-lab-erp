import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('sync_run', { schema: 'legacy_sync' })
export class SyncRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ type: 'text', default: 'RUNNING' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  source!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  extractedAt!: Date | null;

  @Column({ type: 'integer', default: 0 })
  sourceRows!: number;

  @Column({ type: 'integer', default: 0 })
  upserted!: number;

  @Column({ type: 'integer', default: 0 })
  unchanged!: number;

  @Column({ type: 'integer', default: 0 })
  quarantined!: number;

  @Column({ type: 'jsonb', nullable: true })
  metrics!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('quarantine', { schema: 'legacy_sync' })
export class QuarantineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  syncRunId!: string;

  @Column({ type: 'text' })
  sheet!: string;

  @Column({ type: 'integer', nullable: true })
  rowNumber!: number | null;

  @Column({ type: 'text', nullable: true })
  legacyId!: string | null;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  detail!: string | null;

  @Column({ type: 'jsonb' })
  raw!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
