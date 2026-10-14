import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncRunEntity, QuarantineEntity } from './domain/sync.entity';
import { ExcelIngestionService } from './excel-ingestion.service';

@Module({
  imports: [TypeOrmModule.forFeature([SyncRunEntity, QuarantineEntity])],
  providers: [ExcelIngestionService],
  exports: [ExcelIngestionService],
})
export class LegacySyncModule {}
