# CompanyLab ERP — Internal Operations Platform

Modern replacement for spreadsheet-driven back-office workflows (Google Sheets + Apps Script).
First module: **IT Asset Allocation** (laptop allocation, return, repair).

---

## Tech Stack & Standards

| Layer / Component    | Technology                               | Version / Spec                                            |
| :------------------- | :--------------------------------------- | :-------------------------------------------------------- |
| **Runtime**          | Node.js                                  | `>= 20.0.0` (codified in `.nvmrc` and `engines`)          |
| **Package Manager**  | pnpm                                     | `10.33.0` (pinned via `packageManager`)                   |
| **Monorepo Tool**    | Turborepo                                | `^2.4.4`                                                  |
| **Backend**          | NestJS, TypeScript, TypeORM              | Nest 10, TS 5.7                                           |
| **Frontend**         | Next.js (App Router), React, TailwindCSS | Next 15, React 19                                         |
| **Database**         | PostgreSQL                               | `16-alpine` (`timestamptz` in UTC, `TZ=Asia/Ho_Chi_Minh`) |
| **Shared Contracts** | Zod, TypeScript                          | Enums, DTOs, FSM workflow in `@companylab/contracts`      |
| **Auth**             | Firebase Authentication                  | Google provider, linked to employee email                 |
| **Infra**            | Docker, GitHub Actions, GCP              | Cloud Run, Cloud SQL, Secret Manager                      |

---

## Workspace Layout

```
.
├── apps/
│   ├── api/          # NestJS backend API & TypeORM migrations (Port 3001)
│   └── web/          # Next.js App Router frontend (Port 3000)
├── packages/
│   ├── contracts/    # Shared Zod schemas, FSM state machine, request DTOs
│   └── tsconfig/     # Base TypeScript configs
├── infra/
│   └── docker-compose.yml # Local PostgreSQL 16 container definition
├── raw/              # Legacy synthetic sample data (IT Operations - Legacy Demo.xlsx)
└── docs/             # Architecture Decision Records (ADRs) and specs
```

---

## Getting Started

### 1. Prerequisites

- **Node.js**: `>= 20.0.0` (run `nvm use` if using NVM).
- **pnpm**: `pnpm@10.33.0` (enable via `corepack enable`).
- **Docker**: Docker Desktop / Docker Engine for PostgreSQL.

### 2. Installation

Install all workspace dependencies:

```bash
pnpm install
```

### 3. Environment Configuration

Verify or copy the environment configuration files:

- **API (`apps/api/.env`)**:
  ```env
  PORT=3001
  NODE_ENV=development
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_USER=clt_admin
  DATABASE_PASSWORD=clt_password_local
  DATABASE_NAME=clt_erp_dev
  TZ=Asia/Ho_Chi_Minh
  ```
- **Web (`apps/web/.env.local`)**:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```

### 4. Database Setup

Start the local PostgreSQL 16 container:

```bash
pnpm db:up
# or: docker compose -f infra/docker-compose.yml up -d
```

Apply database migrations:

```bash
pnpm db:migrate
```

_(Optional)_ Seed / Synchronize data from Google Sheets:

```bash
# Check Google Sheets connection and access
pnpm legacy:check-sheets

# Synchronize directly from Google Sheets
pnpm db:seed

```

### 5. Start Development

Start all applications concurrently:

```bash
pnpm dev
```

---

## Service URLs

| Service                 | URL                                                              | Note                                 |
| :---------------------- | :--------------------------------------------------------------- | :----------------------------------- |
| **Web Application**     | [http://localhost:3000](http://localhost:3000)                   | Next.js Frontend                     |
| **API Server**          | [http://localhost:3001](http://localhost:3001)                   | NestJS Backend                       |
| **Swagger OpenAPI**     | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) | Interactive API Documentation        |
| **PostgreSQL Database** | `localhost:5432`                                                 | DB: `clt_erp_dev`, User: `clt_admin` |

---

## Available Scripts

| Command                    | Description                                            |
| :------------------------- | :----------------------------------------------------- |
| `pnpm dev`                 | Start all packages in development mode with hot reload |
| `pnpm build`               | Build all applications and packages                    |
| `pnpm test`                | Run test suites across the monorepo                    |
| `pnpm typecheck`           | Run TypeScript type checks across all packages         |
| `pnpm lint`                | Run linter across all packages                         |
| `pnpm format`              | Format code with Prettier                              |
| `pnpm db:up`               | Start local PostgreSQL 16 container                    |
| `pnpm db:down`             | Stop local PostgreSQL container                        |
| `pnpm db:migrate`          | Run TypeORM migrations in `apps/api`                   |
| `pnpm db:seed`             | Synchronize data from Google Sheets into PostgreSQL    |
| `pnpm legacy:check-sheets` | Validate Google Sheets API connection and read access  |
| `pnpm legacy:sync-sheets`  | Run Google Sheets synchronization pipeline             |

---

## Architecture Decisions

| ADR                                                            | Decision                                                     |
| :------------------------------------------------------------- | :----------------------------------------------------------- |
| [0001](docs/adr/0001-single-source-of-truth-per-phase.md)      | One system of record per migration phase; one-way sync first |
| [0002](docs/adr/0002-modular-monolith-erp-bounded-contexts.md) | Modular monolith organised by ERP bounded contexts           |
| [0003](docs/adr/0003-service-request-workflow-fsm.md)          | Code-defined FSM shared by all request types                 |
| [0004](docs/adr/0004-identifiers-time-and-constraints.md)      | UUID + legacy_id, `timestamptz`, integrity in PostgreSQL     |
| [0005](docs/adr/0005-identity-google-auth.md)                  | Firebase Auth (Google), employee linked by email             |

---

## Roadmap

| Phase                   | Scope                                                                     | Exit criteria                                   |
| :---------------------- | :------------------------------------------------------------------------ | :---------------------------------------------- |
| 0. Data audit           | Full-coverage profiling of legacy workbook, FSM spec, ID/time rules       | Audit report committed                          |
| 1. Foundation           | Monorepo, docker-compose Postgres, entities + migrations with constraints | `pnpm db:migrate` green, constraints tested     |
| 2. One-way ingest       | XLSX/Sheets → staging → validate → core, quarantine, reconciliation       | 100% rows reconciled or quarantined with reason |
| 3. Workflow API         | FSM transitions in transactions, RBAC, row locking, OpenAPI               | FSM unit + integration tests (Testcontainers)   |
| 4. Web (read)           | Requests list/detail + timeline, asset inventory, reconciliation view     | Shadow-run alongside Sheets                     |
| 5. Web (write) + flip   | Firebase Auth, actions, outbox write-back to Sheets                       | Zero reconciliation diff for N days             |
| 6. GCP                  | Dockerfiles, GitHub Actions, Cloud Run (api, web, sync job), Cloud SQL    | Deploy on merge to `main`                       |
| 7. Analytics (optional) | Datastream CDC → BigQuery                                                 | Dashboard on BigQuery                           |

## Live Google Sheets ingestion (shadow mode)

See [the live sync runbook](docs/runbooks/live-sheets-sync.md) for credential
setup, spreadsheet access, execution, reconciliation and recovery.

```bash
pnpm --filter @companylab/contracts build
pnpm db:migrate
pnpm sync:run
```

Configure `apps/api/.env` using `.env.example`. Google Sheets is the only
supported sync source for `sync:run` and `db:seed`.
All commands use the same staging,
validation and atomic promotion pipeline. The application never writes back
to Google Sheets in this phase. API transitions return HTTP 403, including
requests supplying forged actor headers. Firebase authentication and phase-B
outbox are still future work, not an enabled feature of this release.
