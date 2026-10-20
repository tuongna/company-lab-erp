import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { validateEnv } from './config/env.schema';
import { EmployeeEntity } from './modules/organization/domain/employee.entity';
import { AssetEntity } from './modules/asset/domain/asset.entity';
import { ServiceRequestEntity } from './modules/service-request/domain/service-request.entity';
import { RequestHistoryEntity } from './modules/service-request/domain/request-history.entity';
import { AttachmentEntity } from './modules/service-request/domain/attachment.entity';
import { SyncRunEntity, QuarantineEntity } from './modules/legacy-sync/domain/sync.entity';
import { OrganizationModule } from './modules/organization/organization.module';
import { AssetModule } from './modules/asset/asset.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';
import { LegacySyncModule } from './modules/legacy-sync/legacy-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
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
    }),
    OrganizationModule,
    AssetModule,
    ServiceRequestModule,
    LegacySyncModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
