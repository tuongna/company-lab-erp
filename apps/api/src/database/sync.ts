import { AppDataSource } from './data-source';
import { IngestionService } from '../modules/legacy-sync/ingestion.service';
import { SheetsApiSource } from '../modules/legacy-sync/sources/sheets.source';
import { XlsxFileSource } from '../modules/legacy-sync/sources/xlsx.source';
import { resolve } from 'path';
export async function runSync(defaultSource = 'sheets', forceSource = false): Promise<void> {
  const mode = forceSource ? defaultSource : (process.env.LEGACY_SOURCE ?? defaultSource);
  if (!['sheets', 'xlsx'].includes(mode)) throw new Error('LEGACY_SOURCE must be sheets or xlsx');
  const source =
    mode === 'sheets'
      ? new SheetsApiSource(process.env.LEGACY_SPREADSHEET_ID ?? '')
      : new XlsxFileSource(
          process.env.LEGACY_XLSX_PATH
            ? resolve(process.env.LEGACY_XLSX_PATH)
            : resolve(__dirname, '../../../../raw/IT Operations - Legacy Demo.xlsx'),
        );
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
