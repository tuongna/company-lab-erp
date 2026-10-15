import { Workbook } from 'exceljs';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { XlsxFileSource } from './xlsx.source';
import { HEADERS, SHEETS } from '../source';
import { fixture } from '../fixtures';
import { serialToUtc } from '../validate';

it('preserves a real legacy serial without a one-millisecond Date round-trip drift', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'companylab-serial-'));
  try {
    const wb = new Workbook();
    const f = fixture();
    const serial = 45852.418043952544;
    for (const name of SHEETS) {
      const sheet = wb.addWorksheet(name);
      sheet.addRow([...HEADERS[name]]);
      for (const row of f.rows.filter((r) => r.sheet === name))
        sheet.addRow(HEADERS[name].map((h) => row.raw[h] ?? null));
      if (name === 'RequestHistory') {
        sheet.getCell('F2').value = serial;
        sheet.getCell('F2').numFmt = 'yyyy-mm-dd hh:mm:ss.000';
      }
    }
    const file = join(dir, 'serial.xlsx');
    await wb.xlsx.writeFile(file);
    const snapshot = await new XlsxFileSource(file).read();
    const timestamp = snapshot.rows.find((r) => r.sheet === 'RequestHistory')!.raw.occurred_at;
    expect(timestamp).toBe(serial);
    expect(serialToUtc(timestamp)).toBe('2025-07-14T03:01:58.997Z');
  } finally {
    await rm(dir, { recursive: true });
  }
});
