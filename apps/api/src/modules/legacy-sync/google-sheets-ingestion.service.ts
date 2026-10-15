import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IngestionService } from './ingestion.service';
import { SheetsApiSource } from './sources/sheets.source';

/** Compatibility entry point; all sources share staging, validation and promotion. */
@Injectable()
export class GoogleSheetsIngestionService {
  constructor(private readonly dataSource: DataSource) {}
  ingestFromGoogleSheets() {
    return new IngestionService(this.dataSource).run(
      new SheetsApiSource(process.env.LEGACY_SPREADSHEET_ID ?? ''),
    );
  }
}
