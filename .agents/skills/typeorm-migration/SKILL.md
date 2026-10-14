---
name: typeorm-migration
description: Use this skill when creating, reviewing, running, or reverting a TypeORM migration for the PostgreSQL database in apps/api (new table, column, index, constraint, backfill).
---

# TypeORM migration workflow

## Steps

1. Change / add the entity in `apps/api/src/modules/<module>/domain/`.
2. Generate against a local DB that is at the latest migration:
   ```bash
   docker compose up -d postgres
   pnpm --filter api db:migrate
   pnpm --filter api db:generate src/migrations/<Verb><Thing>   # e.g. AddAssetHolderIndex
   ```
   (Scripts are defined in `apps/api/package.json`; check there if names differ.)
3. **Edit the generated file** — generation is a draft, not the answer:
   - Add what TypeORM cannot express: `CHECK`, partial unique indexes,
     `NOT VALID` + `VALIDATE`, grants (e.g. append-only `request_history`).
   - Rename auto-generated constraint names to readable ones
     (`ck_asset_assigned_has_holder`, `uq_asset_one_laptop_per_holder`).
   - Large table index → `CREATE INDEX CONCURRENTLY` and
     `public transaction = false;` on the class.
   - Write a real `down()`.
4. Check it against the `database-postgres` rule (expand → contract,
   backward compatible with the running Cloud Run revision).
5. Verify round-trip:
   ```bash
   pnpm --filter api db:migrate
   pnpm --filter api db:revert
   pnpm --filter api db:migrate
   pnpm --filter api db:generate src/migrations/Check --dryrun   # must report no changes
   ```
6. Add/extend an integration test that proves each new constraint rejects bad
   data (expect PG codes `23505`, `23503`, `23514`).
7. Commit entity + migration + test together: `feat(db): ...`.

## Template for a constraint-heavy migration

See [constraint-migration.ts](./examples/constraint-migration.ts).
