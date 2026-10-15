import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { SheetsApiSource } from '../sources/sheets.source';
import { SHEETS } from '../source';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });
async function check() {
  const snapshot = await new SheetsApiSource(process.env.LEGACY_SPREADSHEET_ID ?? '').read();
  console.log(
    JSON.stringify(
      {
        source: snapshot.source,
        extractedAt: snapshot.extractedAt,
        rowCounts: Object.fromEntries(
          SHEETS.map((name) => [name, snapshot.rows.filter((row) => row.sheet === name).length]),
        ),
      },
      null,
      2,
    ),
  );
}
check().catch(() => {
  console.error(
    'Sheets check failed. Check credentials, Viewer access, headers and timezone. No database changes were made.',
  );
  process.exitCode = 1;
});
