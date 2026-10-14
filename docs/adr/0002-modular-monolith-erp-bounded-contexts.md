# ADR-0002: Modular monolith organised by ERP bounded contexts

- Status: Accepted
- Date: 2026-10-14

## Context

The target is an internal back-office ERP. IT asset allocation is the first
module migrated off Google Sheets; more spreadsheet workflows (onboarding /
offboarding, procurement, leave, etc.) are expected to follow. The team is
small and on rotating shifts, so operational simplicity matters more than
independent deployability.

## Decision

One NestJS service (modular monolith) + one Next.js app, in a pnpm/Turborepo
monorepo. Backend modules map to bounded contexts and talk to each other only
through exported services / domain events, never through each other's
repositories.

```
apps/
  api/                 NestJS
    src/modules/
      organization/    employees, departments, roles
      identity/        auth (Firebase / Google OAuth), user <-> employee link
      asset/           IT asset management (ITAM)
      service-request/ requests, workflow FSM, request history (audit trail)
      legacy-sync/     Sheets ingestion, staging, quarantine, reconciliation, outbox
  web/                 Next.js (App Router)
packages/
  contracts/           shared enums + DTO schemas (zod) consumed by api and web
  tsconfig/, eslint-config/
infra/                 docker-compose, Dockerfiles, GitHub Actions, GCP notes
docs/                  ADRs, architecture, runbooks
```

Future modules (e.g. `procurement`, `hr-lifecycle`) plug in as new folders and
reuse `service-request` workflow + `legacy-sync` infrastructure.

## Consequences

- Single deploy unit on Cloud Run, single Cloud SQL database (one schema per
  context is possible later).
- Module boundaries are enforced by lint rules (no cross-module deep imports).
- Extracting a module into its own service later stays possible.
