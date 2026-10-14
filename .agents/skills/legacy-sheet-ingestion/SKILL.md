---
name: legacy-sheet-ingestion
description: Use this skill when adding a new Google Sheet / tab to the legacy-sync pipeline, changing how an existing sheet is mapped into PostgreSQL, or adding a reconciliation metric. Covers staging tables, mappers, quarantine reasons, idempotent upserts, and tests.
---

# Adding a sheet to legacy ingestion

Read first: rule `legacy-sheets-integration`, ADR-0001.

## Steps

1. **Profile** the sheet with skill `legacy-workbook-audit`; list real
   columns, value sets and anomalies.
2. **Confirm phase**: the workflow must be in phase A (Sheets = SoR) for
   inbound ingestion. If it is phase B, you need write-back instead.
3. **Staging table** (migration): `legacy_sync.staging_<sheet>`
   (`sync_run_id`, `row_number`, `legacy_id`, `row_hash`, `raw jsonb`).
4. **Mapper** — pure function, no I/O:
   `map<Sheet>Row(raw, lookups) → { ok: Record } | { quarantine: Reason, detail }`
   - trim strings; empty string → `null`
   - legacy enum → contracts enum via explicit map (unknown → `BAD_ENUM`)
   - serial date → UTC via shared `sheetSerialToUtc()` (unknown → `BAD_TIMESTAMP`)
   - FK lookups by `legacy_id` (missing → `MISSING_FK`; numeric where an ID is
     expected → `COLUMN_SHIFT`)
5. **Upsert**: `INSERT ... ON CONFLICT (legacy_id) DO UPDATE ... WHERE
   target.row_hash IS DISTINCT FROM excluded.row_hash`. Order sheets by
   dependency: Employees → Equipment → Requests → RequestHistory → Attachments.
6. **Reconciliation**: add counts for the sheet to the `sync_run` report
   (source rows, upserted, unchanged, quarantined by reason).
7. **Tests**:
   - mapper unit tests from real anomalous rows (copy from audit report)
   - integration: run ingestion twice on the same fixture → second run
     changes 0 rows (idempotency)
   - fixture: small XLSX/JSON under `apps/api/test/fixtures/legacy/`
8. **Docs**: add the sheet to the mapping table in rule `domain-glossary`.

## Local run without Google credentials

The extractor has two adapters: `SheetsApiSource` (prod) and `XlsxFileSource`
(dev/test, reads `raw/*.xlsx`). Use the file source locally:
`LEGACY_SOURCE=xlsx LEGACY_XLSX_PATH=raw/... pnpm --filter api sync:run`.
