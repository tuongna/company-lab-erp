import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncRunEntity, QuarantineEntity } from './domain/sync.entity';
import { GoogleSheetsIngestionService } from './google-sheets-ingestion.service';

@Module({
  imports: [TypeOrmModule.forFeature([SyncRunEntity, QuarantineEntity])],
  providers: [GoogleSheetsIngestionService],
  exports: [GoogleSheetsIngestionService],
})
export class LegacySyncModule {}
