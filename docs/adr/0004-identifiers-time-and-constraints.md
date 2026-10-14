# ADR-0004: Identifiers, timestamps and database constraints

- Status: Accepted
- Date: 2026-10-14

## Context

- Legacy IDs are inconsistent: `REQ-001`, `G-REQ-00001`, `H-REQ-001`,
  `EVT-001`, raw UUIDs.
- Legacy timestamps are spreadsheet serial numbers in **local time without
  offset** (`timestamp_storage = Local date-time in Asia/Ho_Chi_Minh`), with
  425 cells carrying "timestamp repair" comments and an unverified Apps Script
  project timezone.
- Legacy data checks only scan the first ~40 rows, so their PASS is not
  evidence of integrity.

## Decision

**Identifiers**
- Every table: `id uuid` primary key (generated in DB).
- Migrated tables also have `legacy_id text UNIQUE NULL`. New records created in
  the web app get a human-readable code from a sequence (e.g. `REQ-2026-000123`).

**Time**
- All instants stored as `timestamptz`. Ingestion converts serial → local
  wall-clock in `Asia/Ho_Chi_Minh` (UTC+7, no DST) → UTC explicitly. Never rely
  on server or Apps Script timezone.
- API returns ISO-8601 UTC; the web formats in the business timezone.

**Integrity enforced in PostgreSQL, not only in code**
- Foreign keys for requester, assignee, actor, asset.
- `CHECK (status <> 'ASSIGNED' OR holder_employee_id IS NOT NULL)` and
  `CHECK (status <> 'AVAILABLE' OR holder_employee_id IS NULL)`.
- Max one laptop per employee:
  `CREATE UNIQUE INDEX ... ON asset (holder_employee_id) WHERE type = 'LAPTOP' AND status = 'ASSIGNED'`.
- `request_history` is append-only (no UPDATE/DELETE from the app role).
- Optimistic `version` column on `service_request` and `asset`.

## Consequences

- Rows violating these rules cannot enter core tables; they land in quarantine
  with a reason code — this *is* the full-coverage data check the legacy lacked.
