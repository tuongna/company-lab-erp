---
trigger: model_decision
description: Rules for anything touching Google Sheets, Apps Script, Drive, or the legacy-sync module (ingestion, reconciliation, write-back). Use when reading/writing legacy data or designing sync jobs.
---

# Legacy integration — Google Sheets / Apps Script

## Direction (ADR-0001)

- Check the workflow's current phase before writing sync code:
  A (Sheets is SoR → ingest only), B (PostgreSQL is SoR → write-back via outbox),
  C (retired). Never write to the same entity from both sides.

## Ingestion pipeline

1. **Extract** with Sheets API `spreadsheets.values.batchGet`,
   `valueRenderOption=UNFORMATTED_VALUE`, `dateTimeRenderOption=SERIAL_NUMBER`
   (formatted values are locale-dependent).
2. **Stage** raw rows into `legacy_sync.staging_<sheet>` with `sync_run_id`,
   `row_number` (diagnostics only), `row_hash`, raw JSON.
3. **Validate & map** with a pure mapper per sheet → typed record or
   `QuarantineReason` (`MISSING_FK`, `BAD_ENUM`, `BAD_TIMESTAMP`,
   `COLUMN_SHIFT`, `DUPLICATE_KEY`, `POLICY_VIOLATION`, ...).
4. **Upsert** into core by `legacy_id`; skip unchanged `row_hash`.
5. **Reconcile** and persist a `sync_run` report: counts by type/status,
   quarantined rows, status-vs-latest-event drift.

Identity is the legacy business key, **never** the sheet row number.
Ignore trailing blank rows; treat whitespace-only cells as empty.

## Timestamps

Sheet serial → wall-clock in `Asia/Ho_Chi_Minh` → UTC:
`epoch(1899-12-30) + serial days`, interpret as local time (UTC+7, no DST),
subtract 7h. Reject non-numeric date cells to quarantine (`BAD_TIMESTAMP`).

## Quotas & reliability

- Sheets API: ~60 read requests/min/user — batch ranges, one `batchGet`
  per run; exponential backoff with jitter on 429/5xx.
- Sync runs as Cloud Run Job (Cloud Scheduler); runs are idempotent and
  guarded by a PostgreSQL advisory lock so two runs never overlap.
- Apps Script `onEdit` / `onChange` may call an authenticated webhook
  (OIDC token or HMAC secret) to trigger an incremental run. Webhook only
  enqueues; it never writes core tables directly.

## Apps Script code

- Set project timezone explicitly to `Asia/Ho_Chi_Minh` in `appsscript.json`.
- Use `LockService` around writes; batch `getValues/setValues`, never cell loops.
- Status + history must be written together (legacy currently does not).
- Keep scripts in git via `clasp`; no logic only living in the editor.

## Write-back (phase B)

- Domain events → `legacy_sync.outbox` (same transaction as the change) →
  worker writes to Sheets with `values.batchUpdate`, marks delivered.
- Write-back target sheets are protected ranges; humans must not edit them.
