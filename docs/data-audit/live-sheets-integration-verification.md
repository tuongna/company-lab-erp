# Live Sheets integration verification

Source workbook: `1-ADW3SxNi_ailWvrOUMso8wg8Gga4hVIqvNdq6bws1I`.
The five IT tables were read through the connected Google Sheets integration.
No Google Sheet cells, permissions or Apps Script code were changed.

| Table          | Bundled XLSX | Live read |
| -------------- | -----------: | --------: |
| Employees      |          300 |       301 |
| Equipment      |          600 |       600 |
| Requests       |        8,000 |     8,001 |
| RequestHistory |       29,470 |    29,474 |
| Attachments    |            0 |         0 |
| Total          |       38,370 |    38,376 |

The new validator reports zero problems for both snapshots. This is a full
row-level check, not reliance on the workbook's dashboard formula cells.

## Real data, isolated PostgreSQL-engine test

The shared production ingestion service was exercised against PostgreSQL
WASM (PGlite) in an isolated local database:

1. Import bundled XLSX: 38,370 written, zero quarantined.
2. Import connector-read live snapshot: 7 written, 38,369 unchanged,
   zero quarantined. The seven writes are one employee, one asset update,
   one request and four history events.
3. Replay live snapshot: zero written, 38,376 unchanged.

Observed promotion runs were approximately 3.9s, 1.3s and 1.4s respectively.
These timings exclude Google network calls and are not Cloud SQL benchmarks.
No database credentials were taken from the chat connector. Authenticated
application-to-Google reads still require the user's ADC/service account
setup described in the runbook. Adapter request shape, readonly behavior,
retry and permission-error handling are covered by mocked HTTP tests.

## Regression findings

- Eight workflow/HTTP regression tests failed against the original controller
  and transition service; all twelve tests in those suites pass after fixes.
- Shadow HTTP writes now reject missing or forged actor headers.
- Laptop return checks current ownership. Allocation checks type and
  availability. Employee cancellation checks the requester identity.
- Non-UUID legacy IDs no longer query the UUID column; request row locking
  avoids nullable relation joins.
- Spreadsheet timestamps must retain their raw numeric serial. The real
  event G-REQ-01280-E4 has serial 45852.418043952544. Converting through an
  ExcelJS Date and back shifts it by 1ms. The raw-XML XLSX reader ignores
  styles and preserves the serial, yielding 2025-07-14T03:01:58.997Z like
  the Sheets source. A regression fixture covers this case.
- Reading workbook dimensions repeatedly causes unnecessary row scans.
  Parsing raw row/cell references avoids that cost and preserves sparse row numbers.

Unit/HTTP/SQL-engine tests cover validation, staging, quarantine, unchanged
counts, immutable history, missing source IDs, extraction failure, migration
round-trip, database uniqueness, holder swaps, append-history/status updates
and sparse XLSX rows. The CI workflow additionally uses an actual PostgreSQL
16 service for advisory-lock and concurrent-asset-completion tests.

The live data chunks are transient verification inputs, not committed data
or a new source of truth. Enterprise tabs outside the five IT tables are
not yet imported or modified by this change.

## Follow-up: Sheets-only ingestion

At the owner's request, the Excel adapter, import commands and parser dependencies
were removed after the above migration comparison. Those results document the
historical verification, not an available fallback. The profiling harness now
imports a Sheets snapshot and replays it; sparse-row coverage uses source fixtures.
