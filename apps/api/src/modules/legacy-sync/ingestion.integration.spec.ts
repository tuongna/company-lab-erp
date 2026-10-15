import { PGlite } from '@electric-sql/pglite';
import { DataSource, QueryRunner } from 'typeorm';
import { InitialSchema1760410000000 } from '../../database/migrations/1760410000000-InitialSchema';
import { LegacyStaging1791970000000 } from '../../database/migrations/1791970000000-LegacyStaging';
import { IngestionService } from './ingestion.service';
import { fixture } from './fixtures';
import { hash, Snapshot } from './source';

// Runs production SQL against PostgreSQL WASM, not mocked query results.
// Session advisory-lock concurrency is tested separately against PostgreSQL in CI.
describe('Staging and promotion (PostgreSQL engine)', () => {
  let db: PGlite;
  let q: QueryRunner;
  let service: IngestionService;
  beforeEach(async () => {
    db = new PGlite();
    const runner = {
      isTransactionActive: false,
      connect: async () => {},
      release: async () => {},
      query: async (sql: string, args?: unknown[]) => {
        const result = await db.query(sql, args);
        return result.rows;
      },
      startTransaction: async () => {
        await db.exec('BEGIN');
        runner.isTransactionActive = true;
      },
      commitTransaction: async () => {
        await db.exec('COMMIT');
        runner.isTransactionActive = false;
      },
      rollbackTransaction: async () => {
        await db.exec('ROLLBACK');
        runner.isTransactionActive = false;
      },
    };
    q = runner as unknown as QueryRunner;
    await new InitialSchema1760410000000().up(q);
    await new LegacyStaging1791970000000().up(q);
    service = new IngestionService({ createQueryRunner: () => q } as unknown as DataSource);
  }, 30000);
  afterEach(async () => {
    await db.close();
  });
  const source = (f: Snapshot) => ({
    read: async () => ({ ...f, rows: f.rows.map((r) => ({ ...r, hash: hash(r.raw) })) }),
  });
  it('promotes once, skips unchanged rows on replay and keeps staging for each run', async () => {
    const f = fixture();
    const first = await service.run(source(f));
    const second = await service.run(source(f));
    expect(first.upserted).toBe(5);
    expect(second).toMatchObject({ upserted: 0, unchanged: 5, status: 'COMPLETED' });
    expect(
      (await db.query('SELECT count(*)::int AS n FROM legacy_sync.staging_requesthistory')).rows,
    ).toEqual([{ n: 2 }]);
    expect((await db.query('SELECT count(*)::int AS n FROM request_history')).rows).toEqual([
      { n: 1 },
    ]);
  });
  it('quarantines invalid rows and defers the entire snapshot without touching core', async () => {
    const f = fixture();
    f.rows.find((r) => r.sheet === 'Requests')!.raw.status = 'unknown';
    const result = await service.run(source(f));
    expect(result.status).toBe('REJECTED');
    expect(result.quarantined).toBeGreaterThan(0);
    expect(result.upserted + result.unchanged + result.quarantined + result.deferred).toBe(
      result.sourceRows,
    );
    expect((await db.query('SELECT count(*)::int AS n FROM employee')).rows).toEqual([{ n: 0 }]);
  });
  it('does not count existing immutable history as written during ledger bootstrap', async () => {
    const f = fixture();
    await service.run(source(f));
    await db.exec('DELETE FROM legacy_sync.row_state');
    const replay = await service.run(source(f));
    expect(replay.upserted).toBe(0);
    expect(replay.unchanged).toBe(5);
  });
  it('rejects missing legacy IDs without deleting core records', async () => {
    const f = fixture();
    await service.run(source(f));
    f.rows = f.rows.filter((r) => r.raw.employee_id !== 'OP-1');
    expect((await service.run(source(f))).status).toBe('REJECTED');
    expect((await db.query('SELECT count(*)::int AS n FROM employee')).rows).toEqual([{ n: 2 }]);
  });
  it('rolls back promotion on immutable history change and records FAILED run', async () => {
    const f = fixture();
    await service.run(source(f));
    f.rows.find((r) => r.sheet === 'RequestHistory')!.raw.note = 'edited';
    await expect(service.run(source(f))).rejects.toThrow('history');
    expect((await db.query('SELECT note FROM request_history')).rows).toEqual([
      { note: 'Submitted' },
    ]);
    expect(
      (await db.query("SELECT count(*)::int AS n FROM legacy_sync.sync_run WHERE status='FAILED'"))
        .rows,
    ).toEqual([{ n: 1 }]);
  });
  it('records extraction failures without losing their run', async () => {
    await expect(
      service.run({
        read: async () => {
          throw new Error('unavailable');
        },
      }),
    ).rejects.toThrow('unavailable');
    expect((await db.query('SELECT status FROM legacy_sync.sync_run')).rows).toEqual([
      { status: 'FAILED' },
    ]);
  });
  it('round-trips the additive migration', async () => {
    const migration = new LegacyStaging1791970000000();
    await migration.down(q);
    await migration.up(q);
    expect((await service.run(source(fixture()))).status).toBe('COMPLETED');
  });
  it('database constraints reject two assigned laptops per holder', async () => {
    await service.run(source(fixture()));
    await db.exec(
      "UPDATE asset SET status='ASSIGNED',holder_employee_id=(SELECT id FROM employee WHERE legacy_id='EMP-1')",
    );
    await expect(
      db.exec(
        "INSERT INTO asset(type,model,status,holder_employee_id) SELECT 'LAPTOP','Other','ASSIGNED',id FROM employee WHERE legacy_id='EMP-1'",
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });
  it('imports sparse Excel rows through the same pipeline', async () => {
    const { Workbook } = await import('exceljs');
    const { mkdtemp, rm } = await import('fs/promises');
    const { tmpdir } = await import('os');
    const { join } = await import('path');
    const { HEADERS, SHEETS } = await import('./source');
    const { XlsxFileSource } = await import('./sources/xlsx.source');
    const dir = await mkdtemp(join(tmpdir(), 'companylab-'));
    try {
      const wb = new Workbook();
      const f = fixture();
      for (const name of SHEETS) {
        const sheet = wb.addWorksheet(name);
        sheet.addRow([...HEADERS[name]]);
        let n = 3;
        for (const row of f.rows.filter((r) => r.sheet === name))
          sheet.getRow(n++).values = HEADERS[name].map((h) => row.raw[h] ?? null);
      }
      const file = join(dir, 'fixture.xlsx');
      await wb.xlsx.writeFile(file);
      const result = await service.run(new XlsxFileSource(file));
      expect(result).toMatchObject({ status: 'COMPLETED', upserted: 5 });
      expect(
        (await db.query('SELECT min(row_number)::int AS n FROM legacy_sync.staging_employees'))
          .rows,
      ).toEqual([{ n: 3 }]);
    } finally {
      await rm(dir, { recursive: true });
    }
  });
  it('atomically updates request status with newly appended history', async () => {
    const f = fixture();
    await service.run(source(f));
    f.rows.find((r) => r.sheet === 'Requests')!.raw.status = 'Approved';
    const event = f.rows.find((r) => r.sheet === 'RequestHistory')!;
    f.rows.push({
      ...event,
      rowNumber: 3,
      raw: {
        ...event.raw,
        event_id: 'EVT-2',
        from_status: 'Pending approval',
        to_status: 'Approved',
        actor_id: 'OP-1',
        occurred_at: 46000.1,
      },
    });
    expect((await service.run(source(f))).upserted).toBe(2);
    expect((await db.query('SELECT status FROM service_request')).rows).toEqual([
      { status: 'APPROVED' },
    ]);
    expect((await db.query('SELECT count(*)::int AS n FROM request_history')).rows).toEqual([
      { n: 2 },
    ]);
  });
  it('supports an atomic swap of laptop holders without a transient uniqueness failure', async () => {
    const f = fixture();
    const a = f.rows.find((r) => r.sheet === 'Equipment')!;
    a.raw.status = 'Assigned';
    a.raw.holder_id = 'EMP-1';
    f.rows.push({ ...a, rowNumber: 3, raw: { ...a.raw, asset_id: 'AST-2', holder_id: 'OP-1' } });
    await service.run(source(f));
    a.raw.holder_id = 'OP-1';
    f.rows.find((r) => r.raw.asset_id === 'AST-2')!.raw.holder_id = 'EMP-1';
    expect((await service.run(source(f))).upserted).toBe(2);
  });
});
