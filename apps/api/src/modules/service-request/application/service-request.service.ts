import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceRequestEntity } from '../domain/service-request.entity';
import { RequestHistoryEntity } from '../domain/request-history.entity';

@Injectable()
export class ServiceRequestService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(page = 1, limit = 20, status?: string, type?: string) {
    const repo = this.dataSource.getRepository(ServiceRequestEntity);
    const qb = repo.createQueryBuilder('req')
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

    const request = await reqRepo.findOne({
      where: [{ id }, { legacyId: id }],
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
    const reqRepo = this.dataSource.getRepository(ServiceRequestEntity);
    const assetRepo = this.dataSource.getRepository(ServiceRequestEntity);

    const counts = await this.dataSource.query(`
      SELECT
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL') AS pending_approval,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed,
        COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled,
        COUNT(*) FILTER (WHERE request_type = 'ALLOCATION') AS type_allocation,
        COUNT(*) FILTER (WHERE request_type = 'RETURN') AS type_return,
        COUNT(*) FILTER (WHERE request_type = 'REPAIR') AS type_repair
      FROM service_request;
    `);

    const assetCounts = await this.dataSource.query(`
      SELECT
        COUNT(*) AS total_assets,
        COUNT(*) FILTER (WHERE status = 'AVAILABLE') AS available_assets,
        COUNT(*) FILTER (WHERE status = 'ASSIGNED') AS assigned_assets
      FROM asset;
    `);

    return {
      requests: counts[0],
      assets: assetCounts[0],
      mode: 'READ_ONLY_SHADOW',
      legacySource: 'raw/IT Operations - Legacy Demo.xlsx',
    };
  }
}
