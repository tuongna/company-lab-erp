import { TransitionService } from './transition.service';
import { DataSource, EntityManager } from 'typeorm';
import { ServiceRequestEntity } from '../domain/service-request.entity';
import { RequestHistoryEntity } from '../domain/request-history.entity';
import { AssetEntity } from '../../asset/domain/asset.entity';
import {
  AssetStatus,
  AssetType,
  ServiceRequestStatus,
  ServiceRequestType,
  UserRole,
} from '@companylab/contracts';
import { ConflictException } from '@nestjs/common';

describe('TransitionService (FSM Execution)', () => {
  let service: TransitionService;
  let dataSourceMock: jest.Mocked<DataSource>;
  let emMock: jest.Mocked<EntityManager>;

  beforeEach(() => {
    emMock = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entityClass, entity) => Promise.resolve(entity)),
      create: jest.fn().mockImplementation((entityClass, plain) => plain),
    } as unknown as jest.Mocked<EntityManager>;

    dataSourceMock = {
      transaction: jest.fn().mockImplementation((cb) => cb(emMock)),
    } as unknown as jest.Mocked<DataSource>;

    service = new TransitionService(dataSourceMock);
  });

  it('should successfully transition request and record audit history (Manager approves)', async () => {
    const existingReq = {
      id: 'req-1',
      version: 1,
      status: ServiceRequestStatus.PENDING_APPROVAL,
      requestType: ServiceRequestType.ALLOCATION,
      employeeId: 'emp-1',
    } as ServiceRequestEntity;

    emMock.findOne.mockResolvedValueOnce(existingReq);

    const result = await service.transition(
      'req-1',
      {
        targetStatus: ServiceRequestStatus.APPROVED,
        version: 1,
        note: 'Manager approved',
      },
      'mgr-1',
      UserRole.MANAGER,
    );

    expect(result.status).toBe(ServiceRequestStatus.APPROVED);
    expect(emMock.save).toHaveBeenCalledTimes(2); // save request, save history
    expect(emMock.create).toHaveBeenCalledWith(
      RequestHistoryEntity,
      expect.objectContaining({
        requestId: 'req-1',
        fromStatus: ServiceRequestStatus.PENDING_APPROVAL,
        toStatus: ServiceRequestStatus.APPROVED,
        actorId: 'mgr-1',
        note: 'Manager approved',
      }),
    );
  });

  it('should throw ConflictException on stale version (optimistic locking)', async () => {
    const existingReq = {
      id: 'req-1',
      version: 2, // version changed concurrently
      status: ServiceRequestStatus.PENDING_APPROVAL,
      requestType: ServiceRequestType.ALLOCATION,
    } as ServiceRequestEntity;

    emMock.findOne.mockResolvedValueOnce(existingReq);

    await expect(
      service.transition(
        'req-1',
        {
          targetStatus: ServiceRequestStatus.APPROVED,
          version: 1, // client has version 1
        },
        'mgr-1',
        UserRole.MANAGER,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException if transition is disallowed by role', async () => {
    const existingReq = {
      id: 'req-1',
      version: 1,
      status: ServiceRequestStatus.PENDING_APPROVAL,
      requestType: ServiceRequestType.ALLOCATION,
    } as ServiceRequestEntity;

    emMock.findOne.mockResolvedValueOnce(existingReq);

    await expect(
      service.transition(
        'req-1',
        {
          targetStatus: ServiceRequestStatus.APPROVED,
          version: 1,
        },
        'emp-1',
        UserRole.EMPLOYEE, // Employee cannot approve
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should apply side effect: assign available asset to employee on ALLOCATION COMPLETED', async () => {
    const existingReq = {
      id: 'req-1',
      version: 1,
      status: ServiceRequestStatus.IN_PROGRESS,
      requestType: ServiceRequestType.ALLOCATION,
      employeeId: 'emp-1',
      assetId: null,
    } as ServiceRequestEntity;

    const availableAsset = {
      id: 'asset-1',
      type: AssetType.LAPTOP,
      model: 'MacBook Pro 14',
      status: AssetStatus.AVAILABLE,
      holderEmployeeId: null,
    } as AssetEntity;

    // First findOne: Request
    emMock.findOne.mockResolvedValueOnce(existingReq);
    // Second findOne: Guard check (existing laptop) -> null
    emMock.findOne.mockResolvedValueOnce(null);
    // Third findOne: Asset to assign
    emMock.findOne.mockResolvedValueOnce(availableAsset);

    const result = await service.transition(
      'req-1',
      {
        targetStatus: ServiceRequestStatus.COMPLETED,
        version: 1,
        assignedAssetId: 'asset-1',
      },
      'op-1',
      UserRole.OPERATOR,
    );

    expect(result.status).toBe(ServiceRequestStatus.COMPLETED);
    expect(result.assetId).toBe('asset-1');
    expect(availableAsset.status).toBe(AssetStatus.ASSIGNED);
    expect(availableAsset.holderEmployeeId).toBe('emp-1');
  });
  it.each([
    null,
    {
      id: 'asset-1',
      type: AssetType.LAPTOP,
      status: AssetStatus.ASSIGNED,
      holderEmployeeId: 'someone-else',
    },
    {
      id: 'asset-1',
      type: AssetType.LAPTOP,
      status: AssetStatus.AVAILABLE,
      holderEmployeeId: null,
    },
  ])('rejects return of missing or unowned asset', async (asset) => {
    emMock.findOne
      .mockResolvedValueOnce({
        id: 'req-1',
        version: 1,
        status: ServiceRequestStatus.IN_PROGRESS,
        requestType: ServiceRequestType.RETURN,
        employeeId: 'emp-1',
        assetId: 'asset-1',
      } as ServiceRequestEntity)
      .mockResolvedValueOnce(asset as AssetEntity);
    await expect(
      service.transition(
        'REQ-1',
        { targetStatus: ServiceRequestStatus.COMPLETED, version: 1 },
        'op-1',
        UserRole.OPERATOR,
      ),
    ).rejects.toThrow(ConflictException);
    expect(emMock.save).not.toHaveBeenCalled();
  });
  it('returns an owned assigned laptop and writes history atomically', async () => {
    const asset = {
      id: 'asset-1',
      type: AssetType.LAPTOP,
      status: AssetStatus.ASSIGNED,
      holderEmployeeId: 'emp-1',
    } as AssetEntity;
    emMock.findOne
      .mockResolvedValueOnce({
        id: 'req-1',
        version: 1,
        status: ServiceRequestStatus.IN_PROGRESS,
        requestType: ServiceRequestType.RETURN,
        employeeId: 'emp-1',
        assetId: 'asset-1',
      } as ServiceRequestEntity)
      .mockResolvedValueOnce(asset);
    await service.transition(
      'REQ-1',
      { targetStatus: ServiceRequestStatus.COMPLETED, version: 1 },
      'op-1',
      UserRole.OPERATOR,
    );
    expect(asset.holderEmployeeId).toBeNull();
    expect(emMock.save).toHaveBeenCalledTimes(3);
    expect(emMock.findOne.mock.calls[0]?.[1]).toMatchObject({
      where: { legacyId: 'REQ-1' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(emMock.findOne.mock.calls[0]?.[1]).not.toHaveProperty('relations');
  });
  it('does not allocate a monitor or a laptop already held by the same employee', async () => {
    emMock.findOne
      .mockResolvedValueOnce({
        id: 'req-1',
        version: 1,
        status: ServiceRequestStatus.IN_PROGRESS,
        requestType: ServiceRequestType.ALLOCATION,
        employeeId: 'emp-1',
        assetId: 'asset-1',
      } as ServiceRequestEntity)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'asset-1',
        type: AssetType.MONITOR,
        status: AssetStatus.AVAILABLE,
        holderEmployeeId: null,
      } as AssetEntity);
    await expect(
      service.transition(
        'REQ-1',
        { targetStatus: ServiceRequestStatus.COMPLETED, version: 1 },
        'op-1',
        UserRole.OPERATOR,
      ),
    ).rejects.toThrow(ConflictException);
  });
  it('rejects cancellation of another employee request', async () => {
    emMock.findOne.mockResolvedValueOnce({
      id: 'req-1',
      version: 1,
      status: ServiceRequestStatus.PENDING_APPROVAL,
      employeeId: 'emp-1',
    } as ServiceRequestEntity);
    await expect(
      service.transition(
        'REQ-1',
        { targetStatus: ServiceRequestStatus.CANCELLED, version: 1 },
        'emp-2',
        UserRole.EMPLOYEE,
      ),
    ).rejects.toThrow(ConflictException);
  });
});
