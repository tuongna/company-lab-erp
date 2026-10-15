import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ServiceRequestEntity } from '../domain/service-request.entity';
import { RequestHistoryEntity } from '../domain/request-history.entity';
import { AssetEntity } from '../../asset/domain/asset.entity';
import {
  AssetStatus,
  AssetType,
  ServiceRequestStatus,
  ServiceRequestType,
  TransitionRequestDto,
  UserRole,
  isTransitionAllowed,
} from '@companylab/contracts';

@Injectable()
export class TransitionService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Execute an atomic FSM state transition (ADR-0003, ADR-0004)
   * 1. Lock request row FOR UPDATE
   * 2. Verify optimistic version
   * 3. Validate transition matrix and actor role
   * 4. Apply domain guards and side effects (asset assignment / release)
   * 5. Update request status and bump version
   * 6. Insert audit trail in request_history
   */
  async transition(
    requestId: string,
    dto: TransitionRequestDto,
    actorId: string,
    actorRole: UserRole,
  ): Promise<ServiceRequestEntity> {
    return this.dataSource.transaction(async (em: EntityManager) => {
      // 1. Lock request row FOR UPDATE (Pessimistic write lock)
      const request = await em.findOne(ServiceRequestEntity, {
        where: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)
          ? [{ id: requestId }, { legacyId: requestId }]
          : { legacyId: requestId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request) {
        throw new NotFoundException(`Service request ${requestId} not found`);
      }

      // 2. Optimistic concurrency check (ADR-0004)
      if (request.version !== dto.version) {
        throw new ConflictException(
          `Request has been modified by another operator (expected version ${dto.version}, found ${request.version})`,
        );
      }

      // 3. FSM transition validation (ADR-0003)
      const allowed = isTransitionAllowed(request.status, dto.targetStatus, actorRole);

      if (!allowed) {
        throw new ConflictException(
          `Transition from ${request.status} to ${dto.targetStatus} is not allowed for role ${actorRole}`,
        );
      }

      if (actorRole === UserRole.EMPLOYEE && actorId !== request.employeeId) {
        throw new ConflictException('Employees can only act on their own requests');
      }
      const fromStatus = request.status;

      // 4. Guards & Side Effects per request type (ADR-0003)
      if (dto.targetStatus === ServiceRequestStatus.COMPLETED) {
        if (request.requestType === ServiceRequestType.ALLOCATION) {
          // Determine target asset
          const assetIdToAssign = dto.assignedAssetId || request.assetId;
          if (!assetIdToAssign) {
            throw new BadRequestException(
              'An available asset must be selected to complete laptop allocation',
            );
          }

          // Guard: Requester must not already have an assigned laptop (ADR-0004: max 1 assigned laptop)
          const existingLaptop = await em.findOne(AssetEntity, {
            where: {
              holderEmployeeId: request.employeeId,
              type: AssetType.LAPTOP,
              status: AssetStatus.ASSIGNED,
            },
          });

          if (existingLaptop && existingLaptop.id !== assetIdToAssign) {
            throw new ConflictException(
              `Employee already holds an assigned laptop (${existingLaptop.model})`,
            );
          }

          // Lock asset FOR UPDATE and apply side effect
          const asset = await em.findOne(AssetEntity, {
            where: { id: assetIdToAssign },
            lock: { mode: 'pessimistic_write' },
          });

          if (!asset) {
            throw new NotFoundException(`Asset ${assetIdToAssign} not found`);
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
          asset.holderEmployeeId = request.employeeId;
          await em.save(AssetEntity, asset);

          request.assetId = asset.id;
        } else if (request.requestType === ServiceRequestType.RETURN) {
          if (!request.assetId) throw new BadRequestException('Return requires an assigned laptop');
          const asset = await em.findOne(AssetEntity, {
            where: { id: request.assetId },
            lock: { mode: 'pessimistic_write' },
          });
          if (
            !asset ||
            asset.type !== AssetType.LAPTOP ||
            asset.status !== AssetStatus.ASSIGNED ||
            asset.holderEmployeeId !== request.employeeId
          ) {
            throw new ConflictException('Return asset must be held by the requester');
          }
          asset.status = AssetStatus.AVAILABLE;
          asset.holderEmployeeId = null;
          await em.save(AssetEntity, asset);
        }
      }

      // 5. Update request status
      request.status = dto.targetStatus;
      const updatedRequest = await em.save(ServiceRequestEntity, request);

      // 6. Record audit trail history
      const history = em.create(RequestHistoryEntity, {
        requestId: request.id,
        fromStatus,
        toStatus: dto.targetStatus,
        actorId,
        occurredAt: new Date(),
        note: dto.note || null,
      });
      await em.save(RequestHistoryEntity, history);

      return updatedRequest;
    });
  }
}
