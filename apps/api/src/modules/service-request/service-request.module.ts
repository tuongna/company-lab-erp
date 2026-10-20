import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestEntity } from './domain/service-request.entity';
import { RequestHistoryEntity } from './domain/request-history.entity';
import { AttachmentEntity } from './domain/attachment.entity';
import { ServiceRequestService } from './application/service-request.service';
import { TransitionService } from './application/transition.service';
import { ServiceRequestController } from './http/service-request.controller';
import { AssetModule } from '../asset/asset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequestEntity, RequestHistoryEntity, AttachmentEntity]),
    AssetModule,
  ],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService, TransitionService],
  exports: [ServiceRequestService, TransitionService],
})
export class ServiceRequestModule {}
