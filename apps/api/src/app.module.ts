import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { EmployeeEntity } from './modules/organization/domain/employee.entity';
import { AssetEntity } from './modules/asset/domain/asset.entity';
import { ServiceRequestEntity } from './modules/service-request/domain/service-request.entity';
import { RequestHistoryEntity } from './modules/service-request/domain/request-history.entity';
import { AttachmentEntity } from './modules/service-request/domain/attachment.entity';
import { SyncRunEntity, QuarantineEntity } from './modules/legacy-sync/domain/sync.entity';
import { OrganizationModule } from './modules/organization/organization.module';
import { AssetModule } from './modules/asset/asset.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'clt_admin',
      password: process.env.DATABASE_PASSWORD || 'clt_password_local',
      database: process.env.DATABASE_NAME || 'clt_erp_dev',
      namingStrategy: new SnakeNamingStrategy(),
      entities: [
        EmployeeEntity,
        AssetEntity,
        ServiceRequestEntity,
        RequestHistoryEntity,
        AttachmentEntity,
        SyncRunEntity,
        QuarantineEntity,
      ],
      synchronize: false,
    }),
    OrganizationModule,
    AssetModule,
    ServiceRequestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
