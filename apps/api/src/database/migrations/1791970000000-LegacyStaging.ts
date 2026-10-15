import { MigrationInterface, QueryRunner } from 'typeorm';
export class LegacyStaging1791970000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    for (const sheet of ['employees', 'equipment', 'requests', 'requesthistory', 'attachments']) {
      await q.query(`CREATE TABLE legacy_sync.staging_${sheet} (
        sync_run_id uuid NOT NULL REFERENCES legacy_sync.sync_run(id),
        row_number integer NOT NULL CHECK (row_number >= 2),
        legacy_id text, row_hash text NOT NULL, raw jsonb NOT NULL,
        PRIMARY KEY (sync_run_id, row_number))`);
    }
    await q.query(`CREATE TABLE legacy_sync.row_state (
      sheet text NOT NULL, legacy_id text NOT NULL, row_hash text NOT NULL,
      PRIMARY KEY (sheet, legacy_id))`);
    await q.query(`ALTER TABLE legacy_sync.sync_run ADD COLUMN source text,
      ADD COLUMN extracted_at timestamptz`);
    await q.query(`ALTER TABLE legacy_sync.quarantine ADD COLUMN detail text`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE legacy_sync.quarantine DROP COLUMN detail');
    await q.query('ALTER TABLE legacy_sync.sync_run DROP COLUMN source, DROP COLUMN extracted_at');
    await q.query('DROP TABLE legacy_sync.row_state');
    for (const sheet of ['employees', 'equipment', 'requests', 'requesthistory', 'attachments'])
      await q.query(`DROP TABLE legacy_sync.staging_${sheet}`);
  }
}
