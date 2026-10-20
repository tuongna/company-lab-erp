import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../application/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const devEmployeeHeader =
      request.headers['x-dev-employee-email'] || request.headers['x-dev-employee-id'];

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const user = await this.authService.validateToken(token);
      request.user = user;
      return true;
    }

    if (devEmployeeHeader && typeof devEmployeeHeader === 'string') {
      const user = await this.authService.validateDevUser(devEmployeeHeader.trim());
      request.user = user;
      return true;
    }

    throw new UnauthorizedException('Missing or invalid Authorization header');
  }
}
