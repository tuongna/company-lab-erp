---
trigger: model_decision
description: Conventions for the NestJS backend (apps/api) — module boundaries, TypeORM usage, transactions, DTO validation, error handling, testing. Use when writing or reviewing backend TypeScript.
---

# Backend — NestJS + TypeORM

## Module boundaries (ADR-0002)

- Modules: `organization`, `identity`, `asset`, `service-request`, `legacy-sync`.
- Each module folder: `*.module.ts`, `domain/` (entities, enums, pure logic),
  `application/` (services, use cases), `infrastructure/` (repositories,
  external clients), `http/` (controllers, DTOs).
- A module may import another module's **exported service**, never its
  repository or entity internals. No deep imports like
  `../../asset/infrastructure/...`.
- Cross-module side effects (e.g. request COMPLETED → asset assigned) happen
  inside the same transaction by passing the `EntityManager` to the other
  module's service method.

## TypeORM

- `synchronize: false`, `migrationsRun: false`. Migrations run as a separate
  step (`db:migrate`), never at app boot.
- Entities: `id uuid` PK, `legacy_id text unique null` on migrated tables,
  `created_at` / `updated_at timestamptz`, `version` (`@VersionColumn`) on
  mutable aggregates.
- Column names `snake_case` via naming strategy; TS properties `camelCase`.
- Use `DataSource.transaction(async (em) => ...)` for anything touching more
  than one row. Inside, use `em.getRepository(...)`, not injected repositories.
- Lock rows that a transition depends on:
  `em.findOne(X, { where, lock: { mode: 'pessimistic_write' } })`.
- No N+1: list endpoints use explicit `relations`/joins or QueryBuilder with
  selected columns; paginate with keyset (`created_at, id`) for large tables.

## HTTP layer

- DTOs validated with `class-validator` or zod schemas from
  `packages/contracts`; `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
- Controllers are thin: parse → call application service → map to response DTO.
  Never return entities directly.
- Domain errors are typed (`InvalidTransitionError`, `AssetUnavailableError`, …)
  and mapped to HTTP by one exception filter (409 for conflicts/invalid
  transitions, 404, 403). Map PG `23505`/`23503`/`23514` to 409/422 with a
  readable message.
- OpenAPI via `@nestjs/swagger` on every endpoint.

## Logging & config

- Structured JSON logs (pino) with `requestId`, `userId`, `module`; Cloud
  Logging parses them on Cloud Run. Never log tokens or PII beyond employee id.
- Config through `@nestjs/config` with schema validation; fail fast on boot.

## Testing

- Unit: pure domain logic (FSM table, guards) — no Nest container.
- Integration: Testcontainers PostgreSQL, real migrations, test transactions,
  constraint violations and concurrent transitions (two operators).
- e2e: supertest against the Nest app for critical flows.
