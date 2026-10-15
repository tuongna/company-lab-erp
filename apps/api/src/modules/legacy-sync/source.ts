import { createHash } from 'crypto';

export const HEADERS = {
  Employees: ['employee_id', 'name', 'department', 'role'],
  Equipment: ['asset_id', 'type', 'model', 'status', 'holder_id'],
  Requests: [
    'request_id',
    'employee_id',
    'request_type',
    'status',
    'assigned_to',
    'asset_id',
    'created_at',
  ],
  RequestHistory: [
    'event_id',
    'request_id',
    'from_status',
    'to_status',
    'actor_id',
    'occurred_at',
    'note',
  ],
  Attachments: ['attachment_id', 'request_id', 'drive_file_id', 'name'],
} as const;
export type Sheet = keyof typeof HEADERS;
export const SHEETS = Object.keys(HEADERS) as Sheet[];
export type Cell = string | number | boolean | null;
export type Raw = Record<string, Cell>;
export interface SourceRow {
  sheet: Sheet;
  rowNumber: number;
  raw: Raw;
  hash: string;
}
export interface Snapshot {
  source: string;
  extractedAt: string;
  rows: SourceRow[];
}
export interface LegacySource {
  read(): Promise<Snapshot>;
}
export function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
export function rowsFromValues(sheet: Sheet, values: Cell[][]): SourceRow[] {
  const headers = values[0]?.map(String) ?? [];
  for (const h of HEADERS[sheet]) {
    if (headers.filter((v) => v === h).length !== 1)
      throw new Error(`${sheet}: missing/duplicate header ${h}`);
  }
  return values.slice(1).flatMap((cells, i) => {
    if (!cells.some((v) => v !== null && String(v).trim() !== '')) return [];
    const raw: Raw = {};
    for (const h of HEADERS[sheet]) {
      const cell = cells[headers.indexOf(h)] ?? null;
      raw[h] = typeof cell === 'string' ? cell.trim() || null : cell;
    }
    return [{ sheet, rowNumber: i + 2, raw, hash: hash(raw) }];
  });
}
