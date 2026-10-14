# CLT-ERP — Internal Operations Platform

Modern replacement for spreadsheet-driven back-office workflows
(Google Sheets + Apps Script). First module: **IT Asset Allocation**
(laptop allocation, return, repair).

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS (TypeScript), TypeORM, PostgreSQL 16 |
| Frontend | Next.js (App Router, React, TypeScript) |
| Auth | Firebase Authentication (Google provider) |
| Legacy integration | Google Sheets API, Apps Script webhook |
| Infra | Docker, GitHub Actions, GCP Cloud Run, Cloud SQL, Cloud Scheduler, Secret Manager |
| Analytics (later) | CDC PostgreSQL → BigQuery (Datastream) |

## Architecture decisions

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-single-source-of-truth-per-phase.md) | One system of record per migration phase; one-way sync first |
| [0002](docs/adr/0002-modular-monolith-erp-bounded-contexts.md) | Modular monolith organised by ERP bounded contexts |
| [0003](docs/adr/0003-service-request-workflow-fsm.md) | Code-defined FSM shared by all request types |
| [0004](docs/adr/0004-identifiers-time-and-constraints.md) | UUID + legacy_id, `timestamptz`, integrity in PostgreSQL |
| [0005](docs/adr/0005-identity-google-auth.md) | Firebase Auth (Google), employee linked by email |

## Roadmap

| Phase | Scope | Exit criteria |
|---|---|---|
| 0. Data audit | Full-coverage profiling of legacy workbook, FSM spec, ID/time rules | Audit report committed |
| 1. Foundation | Monorepo, docker-compose Postgres, entities + migrations with constraints | `pnpm db:migrate` green, constraints tested |
| 2. One-way ingest | XLSX/Sheets → staging → validate → core, quarantine, reconciliation | 100% rows reconciled or quarantined with reason |
| 3. Workflow API | FSM transitions in transactions, RBAC, row locking, OpenAPI | FSM unit + integration tests (Testcontainers) |
| 4. Web (read) | Requests list/detail + timeline, asset inventory, reconciliation view | Shadow-run alongside Sheets |
| 5. Web (write) + flip | Firebase Auth, actions, outbox write-back to Sheets | Zero reconciliation diff for N days |
| 6. GCP | Dockerfiles, GitHub Actions, Cloud Run (api, web, sync job), Cloud SQL | Deploy on merge to `main` |
| 7. Analytics (optional) | Datastream CDC → BigQuery | Dashboard on BigQuery |

Legacy source sample: `raw/IT Operations - Legacy Demo.xlsx` (synthetic data).
