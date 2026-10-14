import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestEntity } from './domain/service-request.entity';
import { RequestHistoryEntity } from './domain/request-history.entity';
import { AttachmentEntity } from './domain/attachment.entity';
import { ServiceRequestService } from './application/service-request.service';
import { ServiceRequestController } from './http/service-request.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceRequestEntity,
      RequestHistoryEntity,
      AttachmentEntity,
    ]),
  ],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService],
  exports: [ServiceRequestService],
})
export class ServiceRequestModule {}
