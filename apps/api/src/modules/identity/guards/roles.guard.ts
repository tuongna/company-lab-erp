import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@companylab/contracts';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../domain/auth-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Access denied: User is not authenticated or has no assigned role',
      );
    }

    // ADMIN has superuser privileges across all role-guarded endpoints
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: requires one of [${requiredRoles.join(', ')}], but current role is '${user.role}'`,
      );
    }

    return true;
  }
}
