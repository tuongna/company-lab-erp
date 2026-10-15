/** Optional local verification harness; never connects to the user's database. */
import { PGlite } from '@electric-sql/pglite';
import { DataSource, QueryRunner } from 'typeorm';
import { readSnapshot } from './profile-snapshot';
import { IngestionService } from './ingestion.service';
import { InitialSchema1760410000000 } from '../../database/migrations/1760410000000-InitialSchema';
import { LegacyStaging1791970000000 } from '../../database/migrations/1791970000000-LegacyStaging';
async function main() {
  const live = await readSnapshot();
  console.log('Read comparison snapshot:', live.rows.length);
  const db = new PGlite();
  const runner = {
    isTransactionActive: false,
    connect: async () => {},
    release: async () => {},
    query: async (sql: string, args?: unknown[]) => {
      const start = Date.now();
      const result = await db.query(sql, args);
      if (process.env.PROFILE_SYNC_SQL) console.log(Date.now() - start, sql.slice(0, 80));
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
  const q = runner as unknown as QueryRunner;
  try {
    await new InitialSchema1760410000000().up(q);
    await new LegacyStaging1791970000000().up(q);
    const service = new IngestionService({ createQueryRunner: () => q } as unknown as DataSource);
    for (const [name, snapshot] of [
      ['live', live],
      ['replay', live],
    ] as const) {
      const start = Date.now();
      const result = await service.run({ read: async () => snapshot });
      console.log(JSON.stringify({ name, elapsedMs: Date.now() - start, ...result }));
      if (result.status !== 'COMPLETED' || (name === 'replay' && result.upserted !== 0))
        throw new Error('Verification failed');
    }
  } finally {
    await db.close();
  }
}
if (require.main === module)
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Profile failed');
    process.exitCode = 1;
  });
