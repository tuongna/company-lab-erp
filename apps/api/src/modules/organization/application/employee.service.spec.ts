import { EmployeeService } from './employee.service';
import { DataSource, Repository } from 'typeorm';
import { EmployeeEntity } from '../domain/employee.entity';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let dataSourceMock: jest.Mocked<DataSource>;
  let repoMock: jest.Mocked<Repository<EmployeeEntity>>;

  beforeEach(() => {
    repoMock = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmployeeEntity>>;

    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(repoMock),
    } as unknown as jest.Mocked<DataSource>;

    service = new EmployeeService(dataSourceMock);
  });

  describe('findAll', () => {
    it('should paginate and filter employees by department and search', async () => {
      const qbMock = {
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[{ id: 'emp-1', name: 'John Doe' } as EmployeeEntity], 1]),
      };
      repoMock.createQueryBuilder.mockReturnValue(qbMock as any);

      const result = await service.findAll(1, 10, 'Engineering', 'John');

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(qbMock.andWhere).toHaveBeenCalledWith('emp.department = :department', {
        department: 'Engineering',
      });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        '(emp.name ILIKE :search OR emp.email ILIKE :search)',
        { search: '%John%' },
      );
    });
  });

  describe('findOne', () => {
    it('should query employee by legacy id', async () => {
      const mockEmp = { id: 'emp-uuid', name: 'Alice', legacyId: 'EMP-01' } as EmployeeEntity;
      repoMock.findOne.mockResolvedValue(mockEmp);

      const result = await service.findOne('EMP-01');

      expect(repoMock.findOne).toHaveBeenCalledWith({
        where: { legacyId: 'EMP-01' },
      });
      expect(result).toBe(mockEmp);
    });
  });

  describe('findByEmail', () => {
    it('should query employee by normalized lowercase email', async () => {
      const mockEmp = {
        id: 'emp-uuid',
        name: 'Alice',
        email: 'alice@demo.local',
      } as EmployeeEntity;
      repoMock.findOne.mockResolvedValue(mockEmp);

      const result = await service.findByEmail(' Alice@Demo.Local ');

      expect(repoMock.findOne).toHaveBeenCalledWith({
        where: { email: 'alice@demo.local' },
      });
      expect(result).toBe(mockEmp);
    });
  });
});
