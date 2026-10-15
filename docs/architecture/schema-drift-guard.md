# Database Schema Drift Guard & Live ERD Guide

This document describes how CompanyLab ERP guarantees synchronization between **TypeORM Entities** and **PostgreSQL Database Schema**, and how to safely bypass the check during urgent hotfixes.

---

## 1. Context & Motivation

In our modular monolith ([ADR-0002](file:///Users/nguyenanhtuong.vn/Proj/CompanyLabERP/docs/adr/0002-modular-monolith-erp-bounded-contexts.md)), we enforce two strict architectural rules ([ADR-0004](file:///Users/nguyenanhtuong.vn/Proj/CompanyLabERP/docs/adr/0004-identifiers-time-and-constraints.md)):

1. **Schema changes only via TypeORM migrations** (`synchronize: false`).
2. **Integrity lives in PostgreSQL** (Foreign Keys, CHECK constraints, Partial Unique Indexes).

### The Risk of Silent Schema Drift

When developers add or modify properties in a TypeORM Entity (e.g. `asset.entity.ts`) but forget to generate and apply a corresponding PostgreSQL migration:

- At runtime, TypeORM issues `SELECT column_name ... FROM table`.
- If `column_name` does not exist in PostgreSQL, the database throws `column does not exist`, crashing the API endpoint with a 500 error on production.

---

## 2. Tools Implemented

### A. Automatic Schema Drift Checker (`pnpm db:check-drift`)

- **Script**: [check-schema-drift.ts](file:///Users/nguyenanhtuong.vn/Proj/CompanyLabERP/apps/api/src/database/scripts/check-schema-drift.ts)
- **What it does**: Inspects all registered TypeORM `@Entity()` classes and compares their columns against PostgreSQL's `information_schema.columns`.
- **CI Enforcement**: Runs automatically in [.github/workflows/ci.yml](file:///Users/nguyenanhtuong.vn/Proj/CompanyLabERP/.github/workflows/ci.yml) on every Pull Request. If a column or table is missing in the database, CI fails and blocks merging.

```bash
# Run locally before committing
pnpm db:check-drift
```

### B. Live PostgreSQL ERD Generator (`pnpm db:diagram`)

- **Script**: [generate-erd.ts](file:///Users/nguyenanhtuong.vn/Proj/CompanyLabERP/apps/api/src/database/scripts/generate-erd.ts)
- **Output**: [docs/architecture/database-erd.md](file:///Users/nguyenanhtuong.vn/Proj/CompanyLabERP/docs/architecture/database-erd.md)
- **What it does**: Reads live table catalog, primary keys, and foreign keys directly from PostgreSQL (`public` and `legacy_sync` schemas) and generates an interactive Mermaid ERD diagram.
- **Why it never rots**: Because it reads ground-truth tables from PostgreSQL, it reflects 100% of real database relations, including staging and audit tables.

```bash
# Regenerate diagram after running migrations
pnpm db:diagram
```

---

## 3. Emergency Bypass: The `[skip-drift]` Mechanism

### When should you bypass?

- **P0 Hotfixes**: An urgent production incident needs an immediate fix (e.g. auth issue, frontend bug, worker failure) and should not be blocked by an unrelated schema drift.
- **Acceptable Technical Debt**: When a column exists in the database but the entity has not mapped it yet (safe for reading/writing other columns).

### How to use `[skip-drift]`:

#### Method 1: Git Commit Message (Recommended for PRs / CI)

Include `[skip-drift]` anywhere in your commit message:

```bash
git commit -m "fix(auth): resolve token refresh loop [skip-drift]"
```

When CI or the script runs:

1. It inspects the latest commit message via `git log -1`.
2. It detects `[skip-drift]`.
3. It prints `⏩ [skip-drift] flag detected! Skipping schema drift check.` and exits with code 0 (passing CI).

#### Method 2: Environment Variable

You can also set `SKIP_DRIFT=true`:

```bash
SKIP_DRIFT=true pnpm db:check-drift
```

---

## 4. Daily Workflow Summary

```
                  ┌───────────────────────────────┐
                  │ Developer edits *.entity.ts   │
                  └──────────────┬────────────────┘
                                 │
                                 ▼
                  ┌───────────────────────────────┐
                  │ Generate & run migration      │
                  │ pnpm db:migrate               │
                  └──────────────┬────────────────┘
                                 │
                                 ▼
                  ┌───────────────────────────────┐
                  │ Verify schema drift           │
                  │ pnpm db:check-drift           │
                  └──────────────┬────────────────┘
                                 │
                     No Drift? ──┴──> Yes: Ready to push
                                      No: Create migration or use [skip-drift]
```
