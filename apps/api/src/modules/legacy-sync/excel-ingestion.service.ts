import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IngestionService } from './ingestion.service';
import { XlsxFileSource } from './sources/xlsx.source';
/** Compatibility entry point; all sources share staging, validation and promotion. */
@Injectable()
export class ExcelIngestionService {
  constructor(private readonly dataSource: DataSource) {}
  ingestLegacyFile(filePath: string) {
    return new IngestionService(this.dataSource).run(new XlsxFileSource(filePath));
  }
}
