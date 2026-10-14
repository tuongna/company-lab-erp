import { AppDataSource } from './data-source';
import { ExcelIngestionService } from '../modules/legacy-sync/excel-ingestion.service';
import * as path from 'path';

async function run() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Connected to database.');

  const ingestionService = new ExcelIngestionService(AppDataSource);
  const legacyFilePath = path.resolve(
    __dirname,
    '../../../../raw/IT Operations - Legacy Demo.xlsx',
  );

  await ingestionService.ingestLegacyFile(legacyFilePath);

  await AppDataSource.destroy();
  console.log('Ingestion script finished.');
}

run().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
