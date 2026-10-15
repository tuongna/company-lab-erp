import { existsSync } from 'fs';
import { resolve } from 'path';
import { GoogleAuth } from 'google-auth-library';
import { Cell, HEADERS, LegacySource, Snapshot, SHEETS, rowsFromValues } from '../source';

export function resolveGoogleKeyFile(
  configured = process.env.GOOGLE_APPLICATION_CREDENTIALS,
  cwd = process.cwd(),
): string | undefined {
  const name = configured || 'credentials/google-service-account.json';
  const candidates = [resolve(cwd, name), resolve(cwd, '../..', name)];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (configured && !found) throw new Error('Configured Google credentials file does not exist');
  return found; // Otherwise GoogleAuth uses Application Default Credentials.
}

export interface SheetsTransport {
  get<T>(url: string): Promise<T>;
}
export class GoogleSheetsTransport implements SheetsTransport {
  private readonly auth = new GoogleAuth({
    keyFile: resolveGoogleKeyFile(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  async get<T>(url: string): Promise<T> {
    const client = await this.auth.getClient();
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await client.request<T>({
          url,
          method: 'GET',
          timeout: 30000,
          retry: false,
        });
        return response.data;
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (attempt >= 4 || !(status === 429 || (status !== undefined && status >= 500))) {
          // Do not expose auth request configuration/tokens in CLI logs.
          throw new Error(
            `Google Sheets read failed (${status ?? 'authentication/network'}). Check ADC, API enablement and spreadsheet Viewer access.`,
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * 2 ** attempt + Math.random() * 250),
        );
      }
    }
  }
}
interface Metadata {
  properties: { timeZone: string };
  sheets: {
    properties: { title: string; gridProperties: { rowCount: number; columnCount: number } };
  }[];
}
export class SheetsApiSource implements LegacySource {
  constructor(
    private readonly spreadsheetId: string,
    private readonly transport: SheetsTransport = new GoogleSheetsTransport(),
  ) {
    if (!/^[a-zA-Z0-9_-]+$/.test(spreadsheetId)) throw new Error('Invalid LEGACY_SPREADSHEET_ID');
  }
  async read(): Promise<Snapshot> {
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`;
    const metadata = await this.transport.get<Metadata>(
      `${base}?fields=properties(timeZone),sheets(properties(title,gridProperties))`,
    );
    if (!['Asia/Saigon', 'Asia/Ho_Chi_Minh'].includes(metadata.properties.timeZone)) {
      throw new Error('Expected Vietnam spreadsheet timezone; refusing ambiguous serial dates');
    }
    const query = new URLSearchParams({
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'SERIAL_NUMBER',
      majorDimension: 'ROWS',
    });
    for (const name of SHEETS) {
      const grid = metadata.sheets.find((s) => s.properties.title === name)?.properties
        .gridProperties;
      if (!grid || grid.rowCount > 100000) throw new Error(`Missing/oversized sheet ${name}`);
      // Include all columns so reordered headers and added columns remain safe.
      let n = grid.columnCount;
      let col = '';
      while (n > 0) {
        n--;
        col = String.fromCharCode(65 + (n % 26)) + col;
        n = Math.floor(n / 26);
      }
      if (grid.columnCount > 100 || grid.columnCount < HEADERS[name].length)
        throw new Error(`Unexpected column count in ${name}`);
      query.append('ranges', `'${name}'!A1:${col}${grid.rowCount}`);
    }
    const response = await this.transport.get<{ valueRanges: { values?: Cell[][] }[] }>(
      `${base}/values:batchGet?${query}`,
    );
    if (response.valueRanges?.length !== SHEETS.length)
      throw new Error('Incomplete Sheets API response');
    return {
      source: `sheets:${this.spreadsheetId}`,
      extractedAt: new Date().toISOString(),
      rows: SHEETS.flatMap((name, i) =>
        rowsFromValues(name, response.valueRanges[i]?.values ?? []),
      ),
    };
  }
}
