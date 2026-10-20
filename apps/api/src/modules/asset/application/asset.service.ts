import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AssetEntity } from '../domain/asset.entity';
import { AssetStatus, AssetType } from '@companylab/contracts';
import { byIdOrLegacyId } from '../../../common/utils/identifier.util';

@Injectable()
export class AssetService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(page = 1, limit = 20, status?: AssetStatus, type?: AssetType) {
    const repo = this.dataSource.getRepository(AssetEntity);
    const qb = repo
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.holderEmployee', 'holder')
      .orderBy('asset.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('asset.status = :status', { status });
    }
    if (type) {
      qb.andWhere('asset.type = :type', { type });
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

  async findOne(idOrLegacyId: string): Promise<AssetEntity | null> {
    const repo = this.dataSource.getRepository(AssetEntity);
    const where = byIdOrLegacyId(idOrLegacyId);

    return repo.findOne({
      where,
      relations: ['holderEmployee'],
    });
  }

  /**
   * Domain operation: Assign an available asset to an employee inside a workflow transaction
   */
  async assign(em: EntityManager, assetId: string, employeeId: string): Promise<AssetEntity> {
    // Guard: Requester must not already have an assigned laptop (ADR-0004: max 1 assigned laptop)
    const existingLaptop = await em.findOne(AssetEntity, {
      where: {
        holderEmployeeId: employeeId,
        type: AssetType.LAPTOP,
        status: AssetStatus.ASSIGNED,
      },
    });

    if (existingLaptop && existingLaptop.id !== assetId) {
      throw new ConflictException(
        `Employee already holds an assigned laptop (${existingLaptop.model})`,
      );
    }

    // Lock asset FOR UPDATE and apply side effect
    const asset = await em.findOne(AssetEntity, {
      where: { id: assetId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${assetId} not found`);
    }

    if (
      asset.type !== AssetType.LAPTOP ||
      asset.status !== AssetStatus.AVAILABLE ||
      asset.holderEmployeeId !== null
    ) {
      throw new ConflictException(
        `Asset ${asset.model} is not available (current status: ${asset.status})`,
      );
    }

    asset.status = AssetStatus.ASSIGNED;
    asset.holderEmployeeId = employeeId;
    return em.save(AssetEntity, asset);
  }

  /**
   * Domain operation: Release an assigned asset from an employee inside a workflow transaction
   */
  async release(
    em: EntityManager,
    assetId: string,
    expectedHolderEmployeeId: string,
  ): Promise<AssetEntity> {
    const asset = await em.findOne(AssetEntity, {
      where: { id: assetId },
      lock: { mode: 'pessimistic_write' },
    });

    if (
      !asset ||
      asset.type !== AssetType.LAPTOP ||
      asset.status !== AssetStatus.ASSIGNED ||
      asset.holderEmployeeId !== expectedHolderEmployeeId
    ) {
      throw new ConflictException('Return asset must be held by the requester');
    }

    asset.status = AssetStatus.AVAILABLE;
    asset.holderEmployeeId = null;
    return em.save(AssetEntity, asset);
  }
}
