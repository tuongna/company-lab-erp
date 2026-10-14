import { ServiceRequestService } from './service-request.service';
import { DataSource, Repository } from 'typeorm';
import { ServiceRequestEntity } from '../domain/service-request.entity';
import { RequestHistoryEntity } from '../domain/request-history.entity';

describe('ServiceRequestService', () => {
  let service: ServiceRequestService;
  let dataSourceMock: jest.Mocked<DataSource>;
  let reqRepoMock: jest.Mocked<Repository<ServiceRequestEntity>>;
  let histRepoMock: jest.Mocked<Repository<RequestHistoryEntity>>;

  beforeEach(() => {
    reqRepoMock = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<ServiceRequestEntity>>;

    histRepoMock = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<Repository<RequestHistoryEntity>>;

    dataSourceMock = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === ServiceRequestEntity) return reqRepoMock;
        if (entity === RequestHistoryEntity) return histRepoMock;
        return null;
      }),
      query: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    service = new ServiceRequestService(dataSourceMock);
  });

  describe('findOne', () => {
    it('should query only by legacyId when given a non-UUID legacy identifier (preventing Postgres 22P02 invalid uuid syntax)', async () => {
      const legacyId = 'REQ-001';
      reqRepoMock.findOne.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        legacyId,
      } as ServiceRequestEntity);

      await service.findOne(legacyId);

      expect(reqRepoMock.findOne).toHaveBeenCalledWith({
        where: { legacyId: 'REQ-001' },
        relations: ['employee', 'assignedOperator', 'asset'],
      });
    });

    it('should query by both id and legacyId when given a valid UUID', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      reqRepoMock.findOne.mockResolvedValue({
        id: validUuid,
        legacyId: 'REQ-002',
      } as ServiceRequestEntity);

      await service.findOne(validUuid);

      expect(reqRepoMock.findOne).toHaveBeenCalledWith({
        where: [{ id: validUuid }, { legacyId: validUuid }],
        relations: ['employee', 'assignedOperator', 'asset'],
      });
    });
  });
});
