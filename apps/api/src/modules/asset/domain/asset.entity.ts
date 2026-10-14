import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { AssetType, AssetStatus } from '@companylab/contracts';
import { EmployeeEntity } from '../../organization/domain/employee.entity';

@Entity('asset')
@Index('ix_asset_status_type', ['status', 'type'])
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text', unique: true, nullable: true })
  legacyId!: string | null;

  @Column({ type: 'text' })
  type!: AssetType;

  @Column({ type: 'text' })
  model!: string;

  @Column({
    type: 'text',
    default: AssetStatus.AVAILABLE,
  })
  status!: AssetStatus;

  @Column({ type: 'uuid', nullable: true })
  holderEmployeeId!: string | null;

  @ManyToOne(() => EmployeeEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'holder_employee_id' })
  holderEmployee?: EmployeeEntity | null;

  @VersionColumn({ default: 1 })
  version!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
