import { AppDataSource } from './data-source';
import { GoogleSheetsIngestionService } from '../modules/legacy-sync/google-sheets-ingestion.service';

async function run() {
  console.log('--- Synchronizing from Google Sheets to PostgreSQL ---');
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Connected to database.');

  const syncService = new GoogleSheetsIngestionService(AppDataSource);
  await syncService.ingestFromGoogleSheets();

  await AppDataSource.destroy();
  console.log('Google Sheets sync finished successfully.');
}

run().catch((err) => {
  console.error('Google Sheets sync failed:', err);
  process.exit(1);
});
