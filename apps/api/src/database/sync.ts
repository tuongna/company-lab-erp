import { AppDataSource } from './data-source';
import { IngestionService } from '../modules/legacy-sync/ingestion.service';
import { SheetsApiSource } from '../modules/legacy-sync/sources/sheets.source';
export async function runSync(): Promise<void> {
  const source = new SheetsApiSource(process.env.LEGACY_SPREADSHEET_ID ?? '');
  await AppDataSource.initialize();
  try {
    const result = await new IngestionService(AppDataSource).run(source);
    console.log(JSON.stringify(result));
    if (result.status !== 'COMPLETED') process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
  }
}
if (require.main === module)
  runSync().catch(() => {
    console.error(
      'Sync failed. Check credentials/configuration and legacy_sync.sync_run/staging. No tokens are logged.',
    );
    process.exitCode = 1;
  });
