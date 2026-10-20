import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@companylab/contracts';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflectorMock: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflectorMock);
  });

  function createMockContext(user?: any): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access if route has no @Roles decorator', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has one of the allowed roles', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.OPERATOR, UserRole.MANAGER]);
    const context = createMockContext({ role: UserRole.OPERATOR });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should always allow ADMIN access even if ADMIN is not in required roles', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.EMPLOYEE]);
    const context = createMockContext({ role: UserRole.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user role does not match', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.MANAGER, UserRole.OPERATOR]);
    const context = createMockContext({ role: UserRole.EMPLOYEE });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not authenticated', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.EMPLOYEE]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
