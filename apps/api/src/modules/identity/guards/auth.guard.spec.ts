import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../application/auth.service';
import { UserRole } from '@companylab/contracts';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflectorMock: jest.Mocked<Reflector>;
  let authServiceMock: jest.Mocked<AuthService>;

  const mockUser = {
    id: 'user-uuid',
    legacyId: 'EMP-01',
    name: 'Test User',
    email: 'test@demo.local',
    department: 'IT',
    role: UserRole.EMPLOYEE,
  };

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    authServiceMock = {
      validateToken: jest.fn(),
      validateDevUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    guard = new AuthGuard(reflectorMock, authServiceMock);
  });

  function createMockContext(headers: Record<string, string> = {}): ExecutionContext {
    const request: any = { headers };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access without auth if route is marked as @Public()', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(authServiceMock.validateToken).not.toHaveBeenCalled();
  });

  it('should authenticate with Bearer token in Authorization header', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    authServiceMock.validateToken.mockResolvedValue(mockUser);
    const context = createMockContext({ authorization: 'Bearer token-123' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(authServiceMock.validateToken).toHaveBeenCalledWith('token-123');
    const req = context.switchToHttp().getRequest();
    expect(req.user).toBe(mockUser);
  });

  it('should authenticate with x-dev-employee-email header in dev mode', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    authServiceMock.validateDevUser.mockResolvedValue(mockUser);
    const context = createMockContext({ 'x-dev-employee-email': 'test@demo.local' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(authServiceMock.validateDevUser).toHaveBeenCalledWith('test@demo.local');
    const req = context.switchToHttp().getRequest();
    expect(req.user).toBe(mockUser);
  });

  it('should throw UnauthorizedException when no auth credentials are provided', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
