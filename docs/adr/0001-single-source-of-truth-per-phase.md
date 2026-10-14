# ADR-0001: Single source of truth per migration phase (no early bi-directional sync)

- Status: Accepted
- Date: 2026-10-14

## Context

The legacy IT Operations workflow lives in Google Sheets + Apps Script. The new
platform (NestJS + Next.js + PostgreSQL) must replace it without a big-bang
cut-over, while the legacy system keeps evolving in parallel.

Allowing writes on both sides at the same time requires conflict resolution
(last-writer-wins, field-level merges, clock skew between Apps Script and
Cloud Run). Sheets has no row versioning and row numbers are unstable, so
conflicts cannot be detected reliably.

## Decision

Exactly one system is the **system of record (SoR)** for a given workflow at any
time. Migration proceeds in phases, per workflow:

| Phase | SoR | Sync direction | Web app |
|---|---|---|---|
| A. Shadow | Google Sheets | Sheets → PostgreSQL (one-way) | Read-only + reconciliation report |
| B. Flip | PostgreSQL | PostgreSQL → Sheets (write-back via outbox) | Read/write; sheet becomes a read model |
| C. Retire | PostgreSQL | none (sheet frozen / archived) | Full ownership |

Rules:

1. Ingestion is **idempotent**: upsert by legacy business key (`request_id`,
   `asset_id`, `employee_id`, `event_id`) plus a row content hash. Sheet row
   numbers are never used as identity.
2. Ingestion goes through **staging → validate → core**. Rows failing
   validation are written to a quarantine table, never silently dropped.
3. Every sync run produces a **reconciliation report** (counts per status,
   per type, orphan references, status-vs-latest-event drift).
4. Sync runs as a **Cloud Run Job triggered by Cloud Scheduler** (plus optional
   Apps Script `onEdit` → authenticated webhook for low latency). Never an
   in-process cron inside the API service (scale-to-zero and multi-instance
   make it unreliable/duplicated).
5. Flip (A → B) for a workflow requires N consecutive days of zero
   reconciliation diff.

## Consequences

- Simpler correctness model; no merge logic.
- During phase A users still edit in Sheets; web shows near-real-time data.
- Phase B needs an outbox table + worker for write-back to keep legacy readers
  (dashboards, reports) working.
