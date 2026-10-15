# Live Google Sheets sync — Phase A

## Scope and ownership

Google Sheets remains the system of record for IT. The application reads
Employees, Equipment, Requests, RequestHistory and Attachments. It does not
modify the workbook, run Apps Script, send mail, grant access or move money.
Enterprise tabs (Departments, EmployeeProfiles, Projects, Allocations, etc.)
remain intact but are not yet imported into enterprise domain models.

The ChatGPT connector's Google session is NOT an application credential.
The application requires its own Google identity. Do not paste personal
access tokens or credentials into chat, GitHub, frontend code or environment
variables prefixed NEXT_PUBLIC_.

## One-time setup

1. In a Google Cloud project, enable the Google Sheets API.
2. Create a dedicated service account for CompanyLab's sync job. Share only
   the target spreadsheet with that identity's email as **Viewer**. This
   sharing must be performed by the owner; no sharing changes are made by
   this PR. A personal Google account can own the spreadsheet.
3. For Cloud Run Jobs, attach this service account and use Application
   Default Credentials (ADC); no downloaded key is needed.
4. Locally, use ADC with an OAuth client supporting the Sheets readonly
   scope, or impersonate the service account with the required IAM rights.
   If a service-account JSON key is unavoidable, keep it outside the repo
   and set GOOGLE_APPLICATION_CREDENTIALS to its absolute path. Do not
   commit, upload, print or send the key. This option may be disabled by
   your organization's key-creation policy.
5. Set apps/api/.env: LEGACY_PHASE=shadow, and
   LEGACY_SPREADSHEET_ID (the example contains the existing demo workbook).
   The runtime requests only spreadsheets.readonly scope.
6. Run the database migrations against your local/demo PostgreSQL first.

The application host must be able to reach Google APIs. If the company
network blocks those APIs, execute the sync job on an approved GCP runtime
or another permitted network. Reading through the chat connector does not
make a blocked corporate connection work.

## Run

```bash
pnpm install --frozen-lockfile
pnpm --filter @companylab/contracts build
pnpm db:up
pnpm db:migrate
pnpm sync:run
```

Google Sheets is the only supported ingestion source. Excel import has been removed.

A Sheets API read consists of metadata (timezone, exact tab names/grid bounds)
then one values.batchGet with UNFORMATTED_VALUE and SERIAL_NUMBER. Unknown
headers, missing tabs, unsupported timezone and oversized grids fail closed.
Transient 429/5xx responses use bounded exponential backoff with jitter.
The source adapter makes no write requests.

## Reliability and reconciliation

- A PostgreSQL session advisory lock serializes sync jobs, including source
  extraction. A second job exits without importing anything.
- The job records a RUNNING run before extraction. Raw rows persist in
  staging_<sheet> tables before validation and promotion.
- Validation uses stable IDs, explicit enums, UTC conversion from Vietnam
  wall-clock serials, FK references, laptop ownership constraints, the full
  history chain and request-status/latest-history agreement.
- Unknown values are not silently defaulted. Invalid rows receive quarantine
  reasons. The entire snapshot is deferred when any row is invalid, so a
  request cannot become visible without its corresponding history.
- Snapshot rows missing IDs that already exist in core reject the run;
  deletion is never inferred from source absence.
- Only changed normalized source rows are considered for promotion. Core
  values are compared before writes; unchanged rows and duplicate history
  are counted as unchanged. Imported history cannot be edited silently.
- Status and new history are promoted in the same database transaction.
  Reassigning laptops first releases only affected assets inside that same
  transaction, allowing valid holder swaps without transient unique errors.
- Counts, source, extraction time, request type/status counts and missing-ID
  counts are persisted per run. REJECTED runs have deferred counts in
  metrics. FAILED runs retain staging and the previous accepted core data.
- No source row is identified by spreadsheet row number; row numbers are
  retained solely for diagnostics and tie ordering of legacy timestamps.
- Sheets is not a transactional database. Avoid editing during extraction;
  validation rejects incoherent snapshots, but cannot guarantee a global
  point-in-time snapshot across arbitrary manual edits. Rerun after edits
  finish. Do not perform a phase-B cutover based only on a single clean run.

Inspect:

```sql
SELECT id, status, source, extracted_at, finished_at,
       source_rows, upserted, unchanged, quarantined, metrics
FROM legacy_sync.sync_run ORDER BY started_at DESC LIMIT 10;
SELECT sheet, row_number, legacy_id, reason, detail
FROM legacy_sync.quarantine WHERE sync_run_id = '<run UUID>';
```

Run sync twice: the second unchanged run must report upserted=0. The web
Refresh button reloads PostgreSQL; it does not start a Google API sync.
Schedule this CLI as a Cloud Run Job via Cloud Scheduler when ready. This
PR does not provision GCP resources or create a schedule.

## Access and writes

The transition HTTP route always rejects writes. It no longer trusts
x-actor-id/x-actor-role. Changing LEGACY_PHASE does not enable this route.
Firebase verification, employee identity linkage, authorization and the
phase-B outbox must be implemented before enabling writes. Read endpoints
are still intended for local/synthetic demo use; do not publish them with
real employee data before implementing authentication.

## Recovery / rollback

Fix invalid source data or restore a consistent source checkpoint, then
rerun. Never overwrite history to suppress a conflict. No reset or deletion
of source data is performed. For application rollback, stop the sync job
and revert the application revision; leave additive staging tables in place
for diagnosis. The migration has down() for isolated test databases only;
removing staging tables discards diagnostics and is not a routine rollback.

## References

- https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet
- https://cloud.google.com/docs/authentication/application-default-credentials
- https://github.com/googleapis/google-auth-library-nodejs
