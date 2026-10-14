import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Example: asset table with business-rule constraints (ADR-0004).
 * Copy the shape, not the exact columns.
 */
export class CreateAsset1760400000000 implements MigrationInterface {
  name = 'CreateAsset1760400000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE asset (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_id           text UNIQUE,
        type                text NOT NULL,
        model               text NOT NULL,
        status              text NOT NULL,
        holder_employee_id  uuid REFERENCES employee(id),
        version             integer NOT NULL DEFAULT 1,
        created_at          timestamptz NOT NULL DEFAULT now(),
        updated_at          timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_asset_type   CHECK (type IN ('LAPTOP', 'MONITOR')),
        CONSTRAINT ck_asset_status CHECK (status IN ('AVAILABLE', 'ASSIGNED')),
        CONSTRAINT ck_asset_assigned_has_holder
          CHECK (status <> 'ASSIGNED' OR holder_employee_id IS NOT NULL),
        CONSTRAINT ck_asset_available_no_holder
          CHECK (status <> 'AVAILABLE' OR holder_employee_id IS NULL)
      )`);
    await q.query(`CREATE INDEX ix_asset_holder ON asset (holder_employee_id)`);
    await q.query(`CREATE INDEX ix_asset_status_type ON asset (status, type)`);
    await q.query(`
      CREATE UNIQUE INDEX uq_asset_one_laptop_per_holder
        ON asset (holder_employee_id)
        WHERE type = 'LAPTOP' AND status = 'ASSIGNED'`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE asset`);
  }
}
