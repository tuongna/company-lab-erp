import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeeService } from '../../organization/application/employee.service';
import { FirebaseAdminService } from '../infrastructure/firebase-admin.service';
import { AuthUser } from '../domain/auth-user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly configService: ConfigService,
  ) {}

  async validateToken(token: string): Promise<AuthUser> {
    const isDev =
      this.configService.get<string>('NODE_ENV') !== 'production' ||
      this.configService.get<boolean>('AUTH_DEV_MODE');

    let email: string | undefined;

    // Local development token handling
    if (isDev && (token.startsWith('dev-token:') || token.includes('@demo.local'))) {
      email = token.replace('dev-token:', '').trim();
      this.logger.debug(`[DEV AUTH] Authenticated via dev token for email: ${email}`);
    } else {
      try {
        const decoded = await this.firebaseAdmin.verifyIdToken(token);
        email = decoded.email;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Firebase token verification failed: ${message}`);
        throw new UnauthorizedException('Invalid or expired authentication token');
      }
    }

    if (!email) {
      throw new UnauthorizedException('Authentication token missing verified email address');
    }

    return this.resolveEmployeeByEmail(email);
  }

  async validateDevUser(emailOrId: string): Promise<AuthUser> {
    const isDev =
      this.configService.get<string>('NODE_ENV') !== 'production' ||
      this.configService.get<boolean>('AUTH_DEV_MODE');

    if (!isDev) {
      throw new ForbiddenException('Developer impersonation is disabled in production');
    }

    let employee = await this.employeeService.findByEmail(emailOrId);
    if (!employee) {
      employee = await this.employeeService.findOne(emailOrId);
    }

    if (!employee) {
      throw new ForbiddenException(
        `Employee '${emailOrId}' not found. Please contact IT/HR for onboarding.`,
      );
    }

    return {
      id: employee.id,
      legacyId: employee.legacyId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
    };
  }

  private async resolveEmployeeByEmail(email: string): Promise<AuthUser> {
    const employee = await this.employeeService.findByEmail(email);
    if (!employee) {
      // Per ADR-0005: Unknown emails get a 403 with an onboarding message instead of auto-creating employees
      throw new ForbiddenException(
        `User '${email}' is not registered as an employee in the ERP system. Please contact IT/HR for onboarding.`,
      );
    }

    return {
      id: employee.id,
      legacyId: employee.legacyId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
    };
  }
}
