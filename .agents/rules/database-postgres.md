---
trigger: model_decision
description: PostgreSQL schema design, migration safety, constraints, and SQL performance rules. Use when writing migrations, entities, raw SQL, reports, or investigating slow queries.
---

# Database — PostgreSQL 16 (Cloud SQL)

## Schema rules (ADR-0004)

- Instants: `timestamptz`. Dates without time: `date`. Never `timestamp` without tz.
- Enums: PostgreSQL `text` + `CHECK (col IN (...))` (easier to evolve than
  native enum types); mirror values in `packages/contracts`.
- Every FK column has an index.
- Business rules backed by constraints, e.g.:
  ```sql
  CHECK (status <> 'ASSIGNED'  OR holder_employee_id IS NOT NULL)
  CHECK (status <> 'AVAILABLE' OR holder_employee_id IS NULL)
  CREATE UNIQUE INDEX uq_asset_one_laptop_per_holder
    ON asset (holder_employee_id) WHERE type = 'LAPTOP' AND status = 'ASSIGNED';
  ```
- `request_history` is append-only: app DB role gets `INSERT, SELECT` only.

## Migration safety

- One logical change per migration; always implement `down()`.
- Never edit a migration already merged to `main`; add a new one.
- Zero-downtime pattern (Cloud Run rolls instances):
  expand (add nullable column / new table) → deploy code writing both →
  backfill in batches → contract (NOT NULL / drop old) in a later release.
- `CREATE INDEX CONCURRENTLY` for big tables (requires `transaction = false`
  on that migration).
- Adding a CHECK/FK on existing data: `NOT VALID` first, then
  `VALIDATE CONSTRAINT` in a separate migration.

## Query performance

- Before optimising, capture `EXPLAIN (ANALYZE, BUFFERS)`; include the plan
  in the PR description when changing hot queries.
- Prefer keyset pagination over `OFFSET` for history/requests lists.
- Composite indexes follow filter → sort order, e.g.
  `(status, created_at DESC)` for operator queues,
  `(request_id, occurred_at DESC)` for latest-event lookups.
- Use `DISTINCT ON (request_id) ... ORDER BY request_id, occurred_at DESC`
  or `LATERAL` for "latest event per request"; avoid correlated subqueries
  in loops.
- Aggregations for dashboards: SQL `COUNT(*) FILTER (WHERE ...)`; move heavy
  analytics to BigQuery (CDC) rather than adding OLTP indexes for them.
