import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganizationModule } from '../organization/organization.module';
import { AuthService } from './application/auth.service';
import { FirebaseAdminService } from './infrastructure/firebase-admin.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './http/auth.controller';

@Module({
  imports: [ConfigModule, OrganizationModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAdminService, AuthGuard, RolesGuard],
  exports: [AuthService, FirebaseAdminService, AuthGuard, RolesGuard],
})
export class IdentityModule {}
