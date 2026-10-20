import { AuthController } from './auth.controller';
import { AuthUser } from '../domain/auth-user.interface';
import { UserRole } from '@companylab/contracts';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController();
  });

  it('should return current authenticated user from request', async () => {
    const mockUser: AuthUser = {
      id: 'emp-uuid-1',
      legacyId: 'EMP-01',
      name: 'Bob Smith',
      email: 'bob@demo.local',
      department: 'Finance',
      role: UserRole.MANAGER,
    };

    const result = await controller.getMe(mockUser);
    expect(result).toBe(mockUser);
  });
});
