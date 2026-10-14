import { AppDataSource } from './data-source';
import { GoogleSheetsIngestionService } from '../modules/legacy-sync/google-sheets-ingestion.service';
import { ExcelIngestionService } from '../modules/legacy-sync/excel-ingestion.service';
import * as path from 'path';

async function run() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Connected to database.');

  const useExcel = process.argv.includes('--excel');

  if (useExcel) {
    console.log('--- Ingesting from legacy Excel file ---');
    const ingestionService = new ExcelIngestionService(AppDataSource);
    const legacyFilePath = path.resolve(
      __dirname,
      '../../../../raw/IT Operations - Legacy Demo.xlsx',
    );
    await ingestionService.ingestLegacyFile(legacyFilePath);
  } else {
    console.log('--- Ingesting from Google Sheets ---');
    const syncService = new GoogleSheetsIngestionService(AppDataSource);
    await syncService.ingestFromGoogleSheets();
  }

  await AppDataSource.destroy();
  console.log('Ingestion finished successfully.');
}

run().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
