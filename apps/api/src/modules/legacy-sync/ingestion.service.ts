import { DataSource, QueryRunner } from 'typeorm';
import { LegacySource, SHEETS, Sheet, HEADERS, hash } from './source';
import { validate, TABLES, MappedRow } from './validate';

const FOREIGN_KEYS: Partial<Record<Sheet, Record<string, Sheet>>> = {
  Equipment: { holder_employee_id: 'Employees' },
  Requests: { employee_id: 'Employees', assigned_to: 'Employees', asset_id: 'Equipment' },
  RequestHistory: { request_id: 'Requests', actor_id: 'Employees' },
  Attachments: { request_id: 'Requests' },
};
export interface SyncResult {
  id: string;
  status: string;
  sourceRows: number;
  upserted: number;
  unchanged: number;
  quarantined: number;
  deferred: number;
}
export class IngestionService {
  constructor(private readonly dataSource: DataSource) {}
  async run(source: LegacySource): Promise<SyncResult> {
    if ((process.env.LEGACY_PHASE ?? 'shadow') !== 'shadow')
      throw new Error('Inbound sync is allowed only in shadow phase');
    const q = this.dataSource.createQueryRunner();
    await q.connect();
    let locked = false;
    let id: string | undefined;
    try {
      const locks = (await q.query('SELECT pg_try_advisory_lock(73122, 1) AS locked')) as {
        locked: boolean;
      }[];
      locked = locks[0]?.locked === true;
      if (!locked) throw new Error('Another legacy sync is running');
      const created = (await q.query(
        "INSERT INTO legacy_sync.sync_run(started_at,status) VALUES(now(),'RUNNING') RETURNING id",
      )) as { id: string }[];
      id = created[0]!.id;
      const snapshot = await source.read();
      await q.query('UPDATE legacy_sync.sync_run SET source=$1, extracted_at=$2 WHERE id=$3', [
        snapshot.source,
        snapshot.extractedAt,
        id,
      ]);
      // Persist staging before validation/core promotion. Failed snapshots remain reviewable.
      await q.startTransaction();
      for (const sheet of SHEETS) {
        const records = snapshot.rows
          .filter((r) => r.sheet === sheet)
          .map((r) => ({
            row_number: r.rowNumber,
            legacy_id: r.raw[HEADERS[sheet][0]],
            row_hash: r.hash,
            raw: r.raw,
          }));
        await q.query(
          `INSERT INTO legacy_sync.staging_${sheet.toLowerCase()}(sync_run_id,row_number,legacy_id,row_hash,raw)
          SELECT $1,x.* FROM jsonb_to_recordset($2::jsonb) AS x(row_number integer,legacy_id text,row_hash text,raw jsonb)`,
          [id, JSON.stringify(records)],
        );
      }
      await q.commitTransaction();
      const result = validate(snapshot);
      const sourceIds = new Map(
        SHEETS.map((sheet) => [
          sheet,
          new Set(
            snapshot.rows
              .filter((r) => r.sheet === sheet)
              .map((r) => String(r.raw[HEADERS[sheet][0]])),
          ),
        ]),
      );
      const missing: Record<string, number> = {};
      for (const sheet of SHEETS) {
        const existing = (await q.query(
          `SELECT legacy_id FROM ${TABLES[sheet]} WHERE legacy_id IS NOT NULL`,
        )) as { legacy_id: string }[];
        missing[sheet] = existing.filter((r) => !sourceIds.get(sheet)!.has(r.legacy_id)).length;
      }
      const metrics = {
        source: snapshot.source,
        extractedAt: snapshot.extractedAt,
        bySheet: Object.fromEntries(
          SHEETS.map((s) => [s, snapshot.rows.filter((r) => r.sheet === s).length]),
        ),
        requestCounts: result.rows
          .filter((r) => r.source.sheet === 'Requests')
          .reduce<Record<string, number>>((out, r) => {
            const key = `${r.values.request_type}:${r.values.status}`;
            out[key] = (out[key] ?? 0) + 1;
            return out;
          }, {}),
        missingFromSource: missing,
        problems: result.problems.length,
      };
      const invalid = new Set(
        result.problems.map((p) => `${p.source.sheet}:${p.source.rowNumber}`),
      );
      if (invalid.size || Object.values(missing).some(Boolean)) {
        await q.startTransaction();
        for (const p of result.problems)
          await q.query(
            `INSERT INTO legacy_sync.quarantine(sync_run_id,sheet,row_number,legacy_id,reason,raw,detail) VALUES($1,$2,$3,$4,$5,$6,$7)`,
            [
              id,
              p.source.sheet,
              p.source.rowNumber,
              p.source.raw[HEADERS[p.source.sheet][0]],
              p.reason,
              JSON.stringify(p.source.raw),
              p.detail,
            ],
          );
        await q.query(
          "UPDATE legacy_sync.sync_run SET status='REJECTED',finished_at=now(),source_rows=$1,quarantined=$2,metrics=$3 WHERE id=$4",
          [
            snapshot.rows.length,
            invalid.size,
            JSON.stringify({ ...metrics, deferred: snapshot.rows.length - invalid.size }),
            id,
          ],
        );
        await q.commitTransaction();
        return {
          id,
          status: 'REJECTED',
          sourceRows: snapshot.rows.length,
          upserted: 0,
          unchanged: 0,
          quarantined: invalid.size,
          deferred: snapshot.rows.length - invalid.size,
        };
      }
      await q.startTransaction();
      const states = (await q.query(
        'SELECT sheet,legacy_id,row_hash FROM legacy_sync.row_state',
      )) as { sheet: string; legacy_id: string; row_hash: string }[];
      const hashes = new Map(states.map((s) => [`${s.sheet}:${s.legacy_id}`, s.row_hash]));
      const changed = result.rows.filter(
        (r) => hashes.get(`${r.source.sheet}:${r.values.legacy_id}`) !== hash(r.values),
      );
      // History is immutable. Refuse corrected events rather than silently ignoring changes.
      for (const row of changed.filter((r) => r.source.sheet === 'RequestHistory')) {
        if (hashes.has(`RequestHistory:${row.values.legacy_id}`))
          throw new Error(
            'Source changed an imported history event; manual reconciliation required',
          );
      }
      const lookups = new Map<Sheet, Map<string, string>>();
      let written = 0;
      for (const sheet of SHEETS) {
        const selected = changed.filter((r) => r.source.sheet === sheet);
        written += await this.promote(q, sheet, selected, lookups);
        const current = (await q.query(
          `SELECT id,legacy_id FROM ${TABLES[sheet]} WHERE legacy_id IS NOT NULL`,
        )) as { id: string; legacy_id: string }[];
        lookups.set(sheet, new Map(current.map((r) => [r.legacy_id, r.id])));
      }
      await q.query(
        `INSERT INTO legacy_sync.row_state(sheet,legacy_id,row_hash)
        SELECT x.* FROM jsonb_to_recordset($1::jsonb) AS x(sheet text,legacy_id text,row_hash text)
        ON CONFLICT(sheet,legacy_id) DO UPDATE SET row_hash=excluded.row_hash`,
        [
          JSON.stringify(
            changed.map((r) => ({
              sheet: r.source.sheet,
              legacy_id: r.values.legacy_id,
              row_hash: hash(r.values),
            })),
          ),
        ],
      );
      const unchanged = result.rows.length - written;
      await q.query(
        "UPDATE legacy_sync.sync_run SET status='COMPLETED',finished_at=now(),source_rows=$1,upserted=$2,unchanged=$3,metrics=$4 WHERE id=$5",
        [
          snapshot.rows.length,
          written,
          unchanged,
          JSON.stringify({ ...metrics, statusHistoryDrift: 0 }),
          id,
        ],
      );
      await q.commitTransaction();
      return {
        id,
        status: 'COMPLETED',
        sourceRows: snapshot.rows.length,
        upserted: written,
        unchanged,
        quarantined: 0,
        deferred: 0,
      };
    } catch (error) {
      if (q.isTransactionActive) await q.rollbackTransaction();
      if (id)
        await q.query(
          "UPDATE legacy_sync.sync_run SET status='FAILED',finished_at=now(),metrics=coalesce(metrics,'{}'::jsonb) || $1::jsonb WHERE id=$2",
          [
            JSON.stringify({
              failure:
                'Extraction or atomic promotion failed; inspect staging and rerun after correction',
            }),
            id,
          ],
        );
      throw error;
    } finally {
      if (locked) await q.query('SELECT pg_advisory_unlock(73122, 1)');
      await q.release();
    }
  }
  private async promote(
    q: QueryRunner,
    sheet: Sheet,
    rows: MappedRow[],
    lookups: Map<Sheet, Map<string, string>>,
  ): Promise<number> {
    if (!rows.length) return 0;
    const records = rows.map((row) => {
      const v = { ...row.values };
      for (const [field, target] of Object.entries(FOREIGN_KEYS[sheet] ?? {})) {
        if (v[field] !== null) {
          const id = lookups.get(target)?.get(String(v[field]));
          if (!id) throw new Error(`Unresolved ${sheet}.${field}`);
          v[field] = id;
        }
      }
      return v;
    });
    const fields = Object.keys(records[0]!);
    const types = fields.map(
      (f) =>
        `${f} ${f.endsWith('_at') ? 'timestamptz' : f in (FOREIGN_KEYS[sheet] ?? {}) ? 'uuid' : 'text'}`,
    );
    const table = TABLES[sheet];
    if (sheet === 'RequestHistory') {
      const differing = (await q.query(
        `SELECT count(*)::int AS n FROM ${table} t JOIN jsonb_to_recordset($1::jsonb) AS x(${types.join(',')}) USING(legacy_id) WHERE ${fields
          .filter((f) => f !== 'legacy_id')
          .map((f) => `t.${f} IS DISTINCT FROM x.${f}`)
          .join(' OR ')}`,
        [JSON.stringify(records)],
      )) as { n: number }[];
      if (differing[0]!.n) throw new Error('Existing history differs from source');
    }
    const differences = (await q.query(
      `SELECT x.legacy_id FROM jsonb_to_recordset($1::jsonb) AS x(${types.join(',')}) LEFT JOIN ${table} t USING(legacy_id) WHERE t.id IS NULL OR ${fields
        .filter((f) => f !== 'legacy_id')
        .map((f) => `t.${f} IS DISTINCT FROM x.${f}`)
        .join(' OR ')}`,
      [JSON.stringify(records)],
    )) as { legacy_id: string }[];
    const changedIds = new Set(differences.map((r) => r.legacy_id));
    const changedRecords = records.filter((r) => changedIds.has(String(r.legacy_id)));
    if (!changedRecords.length) return 0;
    if (sheet === 'Equipment') {
      // Release only genuinely changed assets inside this transaction to support holder swaps.
      await q.query(
        "UPDATE asset SET status='AVAILABLE',holder_employee_id=NULL WHERE legacy_id=ANY($1::text[])",
        [[...changedIds]],
      );
    }
    const updates = fields.filter((f) => f !== 'legacy_id').map((f) => `${f}=excluded.${f}`);
    if (sheet === 'Requests' || sheet === 'Equipment')
      updates.push('version=' + table + '.version+1', 'updated_at=now()');
    await q.query(
      `INSERT INTO ${table}(${fields.join(',')}) SELECT x.* FROM jsonb_to_recordset($1::jsonb) AS x(${types.join(',')})
      ON CONFLICT(legacy_id) DO ${sheet === 'RequestHistory' ? 'NOTHING' : `UPDATE SET ${updates.join(',')}`}`,
      [JSON.stringify(changedRecords)],
    );
    return changedRecords.length;
  }
}
