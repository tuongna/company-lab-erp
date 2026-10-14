import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncRunEntity, QuarantineEntity } from './domain/sync.entity';
import { ExcelIngestionService } from './excel-ingestion.service';
import { GoogleSheetsIngestionService } from './google-sheets-ingestion.service';

@Module({
  imports: [TypeOrmModule.forFeature([SyncRunEntity, QuarantineEntity])],
  providers: [ExcelIngestionService, GoogleSheetsIngestionService],
  exports: [ExcelIngestionService, GoogleSheetsIngestionService],
})
export class LegacySyncModule {}
