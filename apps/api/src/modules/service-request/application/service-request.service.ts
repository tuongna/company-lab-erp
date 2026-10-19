import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetStatus, ServiceRequestStatus, ServiceRequestType } from '@companylab/contracts';
import { ServiceRequestEntity } from '../domain/service-request.entity';
import { RequestHistoryEntity } from '../domain/request-history.entity';
import { byIdOrLegacyId } from '../../../common/utils/identifier.util';

@Injectable()
export class ServiceRequestService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(page = 1, limit = 20, status?: string, type?: string) {
    const repo = this.dataSource.getRepository(ServiceRequestEntity);
    const qb = repo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.employee', 'emp')
      .leftJoinAndSelect('req.assignedOperator', 'op')
      .leftJoinAndSelect('req.asset', 'ast')
      .orderBy('req.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('req.status = :status', { status });
    }
    if (type) {
      qb.andWhere('req.requestType = :type', { type });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const reqRepo = this.dataSource.getRepository(ServiceRequestEntity);
    const histRepo = this.dataSource.getRepository(RequestHistoryEntity);

    const where = byIdOrLegacyId(id);

    const request = await reqRepo.findOne({
      where,
      relations: ['employee', 'assignedOperator', 'asset'],
    });

    if (!request) return null;

    const history = await histRepo.find({
      where: { requestId: request.id },
      relations: ['actor'],
      order: { occurredAt: 'ASC' },
    });

    return {
      ...request,
      history,
    };
  }

  async getDashboardStats() {
    const counts = await this.dataSource.query(
      `
      SELECT
        COUNT(*)::int AS total_requests,
        COUNT(*) FILTER (WHERE status = $1)::int AS pending_approval,
        COUNT(*) FILTER (WHERE status = $2)::int AS in_progress,
        COUNT(*) FILTER (WHERE status = $3)::int AS completed,
        COUNT(*) FILTER (WHERE status = $4)::int AS rejected,
        COUNT(*) FILTER (WHERE status = $5)::int AS cancelled,
        COUNT(*) FILTER (WHERE request_type = $6)::int AS type_allocation,
        COUNT(*) FILTER (WHERE request_type = $7)::int AS type_return,
        COUNT(*) FILTER (WHERE request_type = $8)::int AS type_repair
      FROM service_request;
    `,
      [
        ServiceRequestStatus.PENDING_APPROVAL,
        ServiceRequestStatus.IN_PROGRESS,
        ServiceRequestStatus.COMPLETED,
        ServiceRequestStatus.REJECTED,
        ServiceRequestStatus.CANCELLED,
        ServiceRequestType.ALLOCATION,
        ServiceRequestType.RETURN,
        ServiceRequestType.REPAIR,
      ],
    );

    const assetCounts = await this.dataSource.query(
      `
      SELECT
        COUNT(*)::int AS total_assets,
        COUNT(*) FILTER (WHERE status = $1)::int AS available_assets,
        COUNT(*) FILTER (WHERE status = $2)::int AS assigned_assets
      FROM asset;
    `,
      [AssetStatus.AVAILABLE, AssetStatus.ASSIGNED],
    );

    const sync = await this.dataSource.query(
      `SELECT id,status,source,extracted_at,finished_at,source_rows,upserted,unchanged,quarantined,metrics FROM legacy_sync.sync_run ORDER BY started_at DESC LIMIT 1`,
    );
    return {
      requests: counts[0],
      assets: assetCounts[0],
      mode: 'READ_ONLY_SHADOW',
      legacySource: sync[0]?.source ?? 'not-synced',
      lastSync: sync[0] ?? null,
    };
  }
}
