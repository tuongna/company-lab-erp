import { SheetsApiSource, SheetsTransport, GoogleSheetsTransport } from './sheets.source';
import { HEADERS, SHEETS } from '../source';

describe('Sheets API source', () => {
  function transport(timeZone = 'Asia/Saigon') {
    const get = jest
      .fn()
      .mockResolvedValueOnce({
        properties: { timeZone },
        sheets: SHEETS.map((title) => ({
          properties: { title, gridProperties: { rowCount: 1000, columnCount: 26 } },
        })),
      })
      .mockResolvedValueOnce({ valueRanges: SHEETS.map((s) => ({ values: [[...HEADERS[s]]] })) });
    return { get };
  }
  it('requests unformatted serial values in one batch, no writes', async () => {
    const t = transport();
    const f = await new SheetsApiSource('book-id', t as SheetsTransport).read();
    expect(f.source).toBe('sheets:book-id');
    expect(t.get).toHaveBeenCalledTimes(2);
    const url = new URL(t.get.mock.calls[1]![0] as string);
    expect(url.pathname).toContain('/values:batchGet');
    expect(url.searchParams.get('valueRenderOption')).toBe('UNFORMATTED_VALUE');
    expect(url.searchParams.get('dateTimeRenderOption')).toBe('SERIAL_NUMBER');
    expect(url.searchParams.getAll('ranges')).toHaveLength(5);
  });
  it('fails before values read for an unsupported timezone', async () => {
    const t = transport('UTC');
    await expect(new SheetsApiSource('id', t as SheetsTransport).read()).rejects.toThrow(
      'timezone',
    );
    expect(t.get).toHaveBeenCalledTimes(1);
  });
  it('refuses an incomplete response', async () => {
    const t = transport();
    t.get
      .mockReset()
      .mockResolvedValueOnce({
        properties: { timeZone: 'Asia/Saigon' },
        sheets: SHEETS.map((title) => ({
          properties: { title, gridProperties: { rowCount: 10, columnCount: 7 } },
        })),
      })
      .mockResolvedValueOnce({ valueRanges: [] });
    await expect(new SheetsApiSource('id', t as SheetsTransport).read()).rejects.toThrow(
      'Incomplete',
    );
  });
});

describe('Google API retry and credential safety', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  it('retries 429 and 503 then returns successful data', async () => {
    const { GoogleAuth } = await import('google-auth-library');
    const request = jest
      .fn()
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce({ data: { ok: true } });
    jest.spyOn(GoogleAuth.prototype, 'getClient').mockResolvedValue({ request } as never);
    jest.useFakeTimers();
    const pending = new GoogleSheetsTransport().get(
      'https://sheets.googleapis.com/v4/spreadsheets/test',
    );
    await jest.runAllTimersAsync();
    expect(await pending).toEqual({ ok: true });
    expect(request).toHaveBeenCalledTimes(3);
  });
  it('does not retry permission errors or expose auth request contents', async () => {
    const { GoogleAuth } = await import('google-auth-library');
    const request = jest.fn().mockRejectedValue({
      response: { status: 403 },
      config: { headers: { Authorization: 'sensitive-value' } },
    });
    jest.spyOn(GoogleAuth.prototype, 'getClient').mockResolvedValue({ request } as never);
    await expect(
      new GoogleSheetsTransport().get('https://sheets.googleapis.com/v4/spreadsheets/test'),
    ).rejects.toThrow('Google Sheets read failed (403)');
    expect(request).toHaveBeenCalledTimes(1);
  });
});

describe('Google key file compatibility', () => {
  it('finds a repository-relative credential path from the API directory', async () => {
    const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');
    const { resolveGoogleKeyFile } = await import('./sheets.source');
    const root = mkdtempSync(join(tmpdir(), 'sheet-auth-test-'));
    try {
      mkdirSync(join(root, 'credentials'));
      writeFileSync(join(root, 'credentials/reader.json'), '{}');
      expect(resolveGoogleKeyFile('credentials/reader.json', join(root, 'apps/api'))).toBe(
        join(root, 'credentials/reader.json'),
      );
      expect(resolveGoogleKeyFile('', root)).toBeUndefined();
      expect(() => resolveGoogleKeyFile('missing.json', root)).toThrow('does not exist');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
