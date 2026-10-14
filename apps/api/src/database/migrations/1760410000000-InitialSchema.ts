import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760410000000 implements MigrationInterface {
  name = 'InitialSchema1760410000000';

  public async up(q: QueryRunner): Promise<void> {
    // 0. Create schemas
    await q.query(`CREATE SCHEMA IF NOT EXISTS legacy_sync;`);

    // 1. Employee table
    await q.query(`
      CREATE TABLE employee (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_id   text UNIQUE,
        name        text NOT NULL,
        department  text NOT NULL,
        role        text NOT NULL DEFAULT 'EMPLOYEE',
        email       text UNIQUE NOT NULL,
        created_at  timestamptz NOT NULL DEFAULT now(),
        updated_at  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_employee_role CHECK (role IN ('EMPLOYEE', 'MANAGER', 'OPERATOR', 'ADMIN'))
      );
    `);
    await q.query(`CREATE INDEX ix_employee_department ON employee (department);`);

    // 2. Asset table
    await q.query(`
      CREATE TABLE asset (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_id           text UNIQUE,
        type                text NOT NULL,
        model               text NOT NULL,
        status              text NOT NULL DEFAULT 'AVAILABLE',
        holder_employee_id  uuid REFERENCES employee(id) ON DELETE SET NULL,
        version             integer NOT NULL DEFAULT 1,
        created_at          timestamptz NOT NULL DEFAULT now(),
        updated_at          timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_asset_type   CHECK (type IN ('LAPTOP', 'MONITOR')),
        CONSTRAINT ck_asset_status CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE')),
        CONSTRAINT ck_asset_assigned_has_holder
          CHECK (status <> 'ASSIGNED' OR holder_employee_id IS NOT NULL),
        CONSTRAINT ck_asset_available_no_holder
          CHECK (status <> 'AVAILABLE' OR holder_employee_id IS NULL)
      );
    `);
    await q.query(`CREATE INDEX ix_asset_holder ON asset (holder_employee_id);`);
    await q.query(`CREATE INDEX ix_asset_status_type ON asset (status, type);`);
    // Business rule (ADR-0004): Max 1 assigned laptop per employee
    await q.query(`
      CREATE UNIQUE INDEX uq_asset_one_laptop_per_holder
        ON asset (holder_employee_id)
        WHERE type = 'LAPTOP' AND status = 'ASSIGNED';
    `);

    // 3. Service Request table
    await q.query(`
      CREATE TABLE service_request (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_id     text UNIQUE,
        employee_id   uuid NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
        request_type  text NOT NULL,
        status        text NOT NULL DEFAULT 'PENDING_APPROVAL',
        assigned_to   uuid REFERENCES employee(id) ON DELETE SET NULL,
        asset_id      uuid REFERENCES asset(id) ON DELETE SET NULL,
        version       integer NOT NULL DEFAULT 1,
        created_at    timestamptz NOT NULL DEFAULT now(),
        updated_at    timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_request_type CHECK (request_type IN ('ALLOCATION', 'RETURN', 'REPAIR')),
        CONSTRAINT ck_request_status CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'))
      );
    `);
    await q.query(`CREATE INDEX ix_request_employee ON service_request (employee_id);`);
    await q.query(`CREATE INDEX ix_request_assigned_to ON service_request (assigned_to);`);
    await q.query(`CREATE INDEX ix_request_asset ON service_request (asset_id);`);
    await q.query(`CREATE INDEX ix_request_status_type ON service_request (status, request_type);`);

    // 4. Request History (Audit trail)
    await q.query(`
      CREATE TABLE request_history (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_id    text UNIQUE,
        request_id   uuid NOT NULL REFERENCES service_request(id) ON DELETE CASCADE,
        from_status  text,
        to_status    text NOT NULL,
        actor_id     uuid NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
        occurred_at  timestamptz NOT NULL,
        note         text,
        created_at   timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_history_to_status CHECK (to_status IN ('PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED')),
        CONSTRAINT ck_history_from_status CHECK (from_status IS NULL OR from_status IN ('PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'))
      );
    `);
    await q.query(`CREATE INDEX ix_history_request_occurred ON request_history (request_id, occurred_at DESC);`);
    await q.query(`CREATE INDEX ix_history_actor ON request_history (actor_id);`);

    // 5. Attachments
    await q.query(`
      CREATE TABLE attachment (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legacy_id     text UNIQUE,
        request_id    uuid NOT NULL REFERENCES service_request(id) ON DELETE CASCADE,
        drive_file_id text NOT NULL,
        name          text NOT NULL,
        created_at    timestamptz NOT NULL DEFAULT now()
      );
    `);
    await q.query(`CREATE INDEX ix_attachment_request ON attachment (request_id);`);

    // 6. Legacy Sync Tables (Schema: legacy_sync)
    await q.query(`
      CREATE TABLE legacy_sync.sync_run (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        started_at   timestamptz NOT NULL DEFAULT now(),
        finished_at  timestamptz,
        status       text NOT NULL DEFAULT 'RUNNING',
        source_rows  integer NOT NULL DEFAULT 0,
        upserted     integer NOT NULL DEFAULT 0,
        unchanged    integer NOT NULL DEFAULT 0,
        quarantined  integer NOT NULL DEFAULT 0,
        metrics      jsonb,
        created_at   timestamptz NOT NULL DEFAULT now()
      );
    `);

    await q.query(`
      CREATE TABLE legacy_sync.quarantine (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        sync_run_id  uuid NOT NULL REFERENCES legacy_sync.sync_run(id) ON DELETE CASCADE,
        sheet        text NOT NULL,
        row_number   integer,
        legacy_id    text,
        reason       text NOT NULL,
        raw          jsonb NOT NULL,
        created_at   timestamptz NOT NULL DEFAULT now()
      );
    `);
    await q.query(`CREATE INDEX ix_quarantine_sync_run ON legacy_sync.quarantine (sync_run_id);`);
    await q.query(`CREATE INDEX ix_quarantine_sheet_reason ON legacy_sync.quarantine (sheet, reason);`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS legacy_sync.quarantine;`);
    await q.query(`DROP TABLE IF EXISTS legacy_sync.sync_run;`);
    await q.query(`DROP TABLE IF EXISTS attachment;`);
    await q.query(`DROP TABLE IF EXISTS request_history;`);
    await q.query(`DROP TABLE IF EXISTS service_request;`);
    await q.query(`DROP TABLE IF EXISTS asset;`);
    await q.query(`DROP TABLE IF EXISTS employee;`);
    await q.query(`DROP SCHEMA IF EXISTS legacy_sync CASCADE;`);
  }
}
