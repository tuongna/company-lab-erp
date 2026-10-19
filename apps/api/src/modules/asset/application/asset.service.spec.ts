import { AssetService } from './asset.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AssetEntity } from '../domain/asset.entity';
import { AssetStatus, AssetType } from '@companylab/contracts';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AssetService', () => {
  let service: AssetService;
  let dataSourceMock: jest.Mocked<DataSource>;
  let repoMock: jest.Mocked<Repository<AssetEntity>>;

  beforeEach(() => {
    repoMock = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AssetEntity>>;

    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(repoMock),
    } as unknown as jest.Mocked<DataSource>;

    service = new AssetService(dataSourceMock);
  });

  describe('findAll', () => {
    it('should paginate and filter assets', async () => {
      const qbMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'asset-1' } as AssetEntity], 1]),
      };
      repoMock.createQueryBuilder.mockReturnValue(qbMock as any);

      const result = await service.findAll(1, 10, AssetStatus.AVAILABLE, AssetType.LAPTOP);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(qbMock.andWhere).toHaveBeenCalledWith('asset.status = :status', {
        status: AssetStatus.AVAILABLE,
      });
      expect(qbMock.andWhere).toHaveBeenCalledWith('asset.type = :type', {
        type: AssetType.LAPTOP,
      });
    });
  });

  describe('findOne', () => {
    it('should query by id or legacy id', async () => {
      const mockAsset = { id: 'asset-uuid', model: 'Dell Latitude' } as AssetEntity;
      repoMock.findOne.mockResolvedValue(mockAsset);

      const result = await service.findOne('AST-001');

      expect(repoMock.findOne).toHaveBeenCalledWith({
        where: { legacyId: 'AST-001' },
        relations: ['holderEmployee'],
      });
      expect(result).toBe(mockAsset);
    });
  });

  describe('assign', () => {
    let emMock: jest.Mocked<EntityManager>;

    beforeEach(() => {
      emMock = {
        findOne: jest.fn(),
        save: jest.fn().mockImplementation((entityClass, entity) => Promise.resolve(entity)),
      } as unknown as jest.Mocked<EntityManager>;
    });

    it('should successfully assign available asset', async () => {
      const asset = {
        id: 'asset-1',
        type: AssetType.LAPTOP,
        status: AssetStatus.AVAILABLE,
        holderEmployeeId: null,
      } as AssetEntity;

      emMock.findOne
        .mockResolvedValueOnce(null) // no existing laptop
        .mockResolvedValueOnce(asset); // available asset

      const assigned = await service.assign(emMock, 'asset-1', 'emp-1');

      expect(assigned.status).toBe(AssetStatus.ASSIGNED);
      expect(assigned.holderEmployeeId).toBe('emp-1');
      expect(emMock.save).toHaveBeenCalledWith(AssetEntity, asset);
    });

    it('should throw ConflictException if requester already holds a laptop', async () => {
      const existingLaptop = {
        id: 'asset-other',
        type: AssetType.LAPTOP,
        status: AssetStatus.ASSIGNED,
        holderEmployeeId: 'emp-1',
        model: 'MacBook Pro',
      } as AssetEntity;

      emMock.findOne.mockResolvedValueOnce(existingLaptop);

      await expect(service.assign(emMock, 'asset-1', 'emp-1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      emMock.findOne
        .mockResolvedValueOnce(null) // no existing laptop
        .mockResolvedValueOnce(null); // asset not found

      await expect(service.assign(emMock, 'asset-1', 'emp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('release', () => {
    let emMock: jest.Mocked<EntityManager>;

    beforeEach(() => {
      emMock = {
        findOne: jest.fn(),
        save: jest.fn().mockImplementation((entityClass, entity) => Promise.resolve(entity)),
      } as unknown as jest.Mocked<EntityManager>;
    });

    it('should successfully release assigned asset', async () => {
      const asset = {
        id: 'asset-1',
        type: AssetType.LAPTOP,
        status: AssetStatus.ASSIGNED,
        holderEmployeeId: 'emp-1',
      } as AssetEntity;

      emMock.findOne.mockResolvedValueOnce(asset);

      const released = await service.release(emMock, 'asset-1', 'emp-1');

      expect(released.status).toBe(AssetStatus.AVAILABLE);
      expect(released.holderEmployeeId).toBeNull();
      expect(emMock.save).toHaveBeenCalledWith(AssetEntity, asset);
    });

    it('should throw ConflictException if asset is not held by the requester', async () => {
      const asset = {
        id: 'asset-1',
        type: AssetType.LAPTOP,
        status: AssetStatus.ASSIGNED,
        holderEmployeeId: 'someone-else',
      } as AssetEntity;

      emMock.findOne.mockResolvedValueOnce(asset);

      await expect(service.release(emMock, 'asset-1', 'emp-1')).rejects.toThrow(ConflictException);
    });
  });
});
