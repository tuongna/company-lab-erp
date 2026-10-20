import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { EmployeeService } from '../../organization/application/employee.service';
import { FirebaseAdminService } from '../infrastructure/firebase-admin.service';
import { EmployeeEntity } from '../../organization/domain/employee.entity';
import { UserRole } from '@companylab/contracts';

describe('AuthService', () => {
  let service: AuthService;
  let employeeServiceMock: jest.Mocked<EmployeeService>;
  let firebaseAdminMock: jest.Mocked<FirebaseAdminService>;
  let configServiceMock: jest.Mocked<ConfigService>;

  const mockEmployee: EmployeeEntity = {
    id: '11111111-1111-4111-8111-111111111111',
    legacyId: 'EMP-01',
    name: 'Alice Cooper',
    email: 'alice@demo.local',
    department: 'Engineering',
    role: UserRole.EMPLOYEE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    employeeServiceMock = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<EmployeeService>;

    firebaseAdminMock = {
      verifyIdToken: jest.fn(),
    } as unknown as jest.Mocked<FirebaseAdminService>;

    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'AUTH_DEV_MODE') return true;
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AuthService(employeeServiceMock, firebaseAdminMock, configServiceMock);
  });

  describe('validateToken', () => {
    it('should validate dev token in development mode and resolve employee from database', async () => {
      employeeServiceMock.findByEmail.mockResolvedValue(mockEmployee);

      const result = await service.validateToken('dev-token:alice@demo.local');

      expect(employeeServiceMock.findByEmail).toHaveBeenCalledWith('alice@demo.local');
      expect(result).toEqual({
        id: mockEmployee.id,
        legacyId: mockEmployee.legacyId,
        name: mockEmployee.name,
        email: mockEmployee.email,
        department: mockEmployee.department,
        role: mockEmployee.role,
      });
    });

    it('should verify live token using Firebase Admin and map to DB employee', async () => {
      firebaseAdminMock.verifyIdToken.mockResolvedValue({
        email: 'alice@demo.local',
        uid: 'firebase-uid-123',
      } as any);
      employeeServiceMock.findByEmail.mockResolvedValue(mockEmployee);

      const result = await service.validateToken('live-firebase-jwt-token');

      expect(firebaseAdminMock.verifyIdToken).toHaveBeenCalledWith('live-firebase-jwt-token');
      expect(employeeServiceMock.findByEmail).toHaveBeenCalledWith('alice@demo.local');
      expect(result.id).toBe(mockEmployee.id);
    });

    it('should throw ForbiddenException when email is not registered in employee database (ADR-0005 onboarding rule)', async () => {
      firebaseAdminMock.verifyIdToken.mockResolvedValue({
        email: 'unregistered@company.com',
        uid: 'firebase-uid-999',
      } as any);
      employeeServiceMock.findByEmail.mockResolvedValue(null);

      await expect(service.validateToken('live-firebase-jwt-token')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.validateToken('live-firebase-jwt-token')).rejects.toThrow(
        /not registered as an employee in the ERP system/,
      );
    });

    it('should throw UnauthorizedException when token does not contain an email', async () => {
      firebaseAdminMock.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-no-email',
      } as any);

      await expect(service.validateToken('token-without-email')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when Firebase token verification fails', async () => {
      firebaseAdminMock.verifyIdToken.mockRejectedValue(new Error('Token signature invalid'));

      await expect(service.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateDevUser', () => {
    it('should resolve employee by email or legacy id in dev mode', async () => {
      employeeServiceMock.findByEmail.mockResolvedValue(null);
      employeeServiceMock.findOne.mockResolvedValue(mockEmployee);

      const result = await service.validateDevUser('EMP-01');

      expect(employeeServiceMock.findOne).toHaveBeenCalledWith('EMP-01');
      expect(result.legacyId).toBe('EMP-01');
    });

    it('should reject dev impersonation in production environment', async () => {
      configServiceMock.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return undefined;
      });

      await expect(service.validateDevUser('EMP-01')).rejects.toThrow(ForbiddenException);
    });
  });
});
