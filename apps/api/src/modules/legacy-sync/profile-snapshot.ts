import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { SHEETS, rowsFromValues, Cell, Snapshot } from './source';
import { validate } from './validate';
import { SheetsApiSource } from './sources/sheets.source';
export async function readSnapshot(directory = process.env.SNAPSHOT_CHUNKS_DIR): Promise<Snapshot> {
  let snapshot: Snapshot;
  if (directory) {
    const chunks = readdirSync(directory)
      .filter((n) => n.endsWith('.json'))
      .map(
        (n) =>
          JSON.parse(readFileSync(resolve(directory, n), 'utf8')) as {
            sheet: string;
            start: number;
            values: Cell[][];
          },
      );
    snapshot = {
      source: 'connector-live-read',
      extractedAt: new Date().toISOString(),
      rows: SHEETS.flatMap((sheet) =>
        rowsFromValues(
          sheet,
          chunks
            .filter((c) => c.sheet === sheet)
            .sort((a, b) => a.start - b.start)
            .flatMap((c) => c.values),
        ),
      ),
    };
  } else {
    snapshot = await new SheetsApiSource(process.env.LEGACY_SPREADSHEET_ID ?? '').read();
  }
  return snapshot;
}
async function main() {
  const snapshot = await readSnapshot();
  const result = validate(snapshot);
  console.log(
    JSON.stringify({
      source: snapshot.source,
      counts: Object.fromEntries(
        SHEETS.map((s) => [s, snapshot.rows.filter((r) => r.sheet === s).length]),
      ),
      problems: result.problems.length,
      samples: result.problems.slice(0, 10).map((p) => ({
        sheet: p.source.sheet,
        row: p.source.rowNumber,
        reason: p.reason,
        detail: p.detail,
      })),
    }),
  );
  if (result.problems.length) process.exitCode = 1;
}
if (require.main === module)
  main().catch(() => {
    console.error('Snapshot profiling failed');
    process.exitCode = 1;
  });
