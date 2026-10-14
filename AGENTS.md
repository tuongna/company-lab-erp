# CLT-ERP — Agent Guide

Internal back-office ERP replacing Google Sheets + Apps Script workflows.
First module: **IT Asset Allocation** (laptop allocation / return / repair).
Legacy and new system run **in parallel** during migration.

## Stack

NestJS + TypeORM + PostgreSQL 16 (api) · Next.js App Router (web) ·
pnpm + Turborepo monorepo · Firebase Auth (Google) · Google Sheets API / Apps Script ·
Docker · GitHub Actions · GCP Cloud Run, Cloud SQL, Cloud Scheduler, Secret Manager.

## Source of truth

Architecture decisions live in `docs/adr/`. Read the relevant ADR before
changing behaviour it covers; if a change contradicts an ADR, write a new ADR
(skill `write-adr`) instead of silently diverging.

| Topic | ADR |
|---|---|
| Migration / sync direction | 0001 |
| Module layout | 0002 |
| Request workflow (FSM) | 0003 |
| IDs, time, DB constraints | 0004 |
| Auth | 0005 |

## Non-negotiables

1. **One system of record per workflow and phase.** Never add bi-directional
   writes between Sheets and PostgreSQL.
2. **Status change + history row in one DB transaction**, with the request
   row locked. Never update `service_request.status` outside the workflow service.
3. **Integrity lives in PostgreSQL** (FK, CHECK, partial unique indexes), not
   only in TypeScript guards.
4. **Time is `timestamptz` in UTC.** Business timezone is `Asia/Ho_Chi_Minh`;
   convert explicitly, never rely on server / Apps Script timezone.
5. **Schema changes only via TypeORM migrations.** `synchronize: false` everywhere.
6. **Legacy data is untrusted.** Ingest via staging → validate → core;
   bad rows go to quarantine with a reason, never dropped silently.
7. **Shared contracts** (enums, DTO schemas, allowed transitions) live in
   `packages/contracts`; api and web import from there, never duplicate.
8. No secrets in code or git. Use `.env` locally, Secret Manager on GCP.

## Conventions

- Talk to the user in **Vietnamese**; write code, comments, docs, commit
  messages in **English**.
- Conventional Commits (`feat(asset): ...`, `fix(legacy-sync): ...`).
- TypeScript `strict`. No `any` in domain code.
- Every bug fix includes a test that fails before the fix.
- Domain terms: see rule `domain-glossary`.

## Data

`raw/IT Operations - Legacy Demo.xlsx` is **synthetic** legacy data.
Profile it with skill `legacy-workbook-audit` before assuming anything
about its contents — its built-in Dashboard/DataChecks are not reliable.
