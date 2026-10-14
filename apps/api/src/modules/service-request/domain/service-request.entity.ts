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
import { ServiceRequestType, ServiceRequestStatus } from '@clt/contracts';
import { EmployeeEntity } from '../../organization/domain/employee.entity';
import { AssetEntity } from '../../asset/domain/asset.entity';

@Entity('service_request')
@Index('ix_request_status_type', ['status', 'requestType'])
export class ServiceRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text', unique: true, nullable: true })
  legacyId!: string | null;

  @Column({ type: 'uuid' })
  employeeId!: string;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employee_id' })
  employee?: EmployeeEntity;

  @Column({ type: 'text' })
  requestType!: ServiceRequestType;

  @Column({
    type: 'text',
    default: ServiceRequestStatus.PENDING_APPROVAL,
  })
  status!: ServiceRequestStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedTo!: string | null;

  @ManyToOne(() => EmployeeEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignedOperator?: EmployeeEntity | null;

  @Column({ type: 'uuid', nullable: true })
  assetId!: string | null;

  @ManyToOne(() => AssetEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'asset_id' })
  asset?: AssetEntity | null;

  @VersionColumn({ default: 1 })
  version!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
