---
name: erp-module-scaffold
description: Use this skill when adding a new ERP bounded-context module (e.g. procurement, hr-lifecycle, leave) to the NestJS api and Next.js web, typically when migrating another spreadsheet workflow.
---

# Scaffolding a new ERP module

Read first: ADR-0002, rule `backend-nestjs`.

## Steps

1. **Decide scope**: write a short ADR (skill `write-adr`) naming the module,
   the legacy sheet(s) it replaces, its entities, and which existing modules it
   depends on (usually `organization`, `identity`, `service-request`).
2. **Contracts** `packages/contracts/src/<module>/`: enums, zod DTO schemas,
   export from package index.
3. **API** `apps/api/src/modules/<module>/`:
   ```
   <module>.module.ts
   domain/          entities, enums re-exported from contracts, pure rules
   application/     services / use cases
   infrastructure/  repositories, external clients
   http/            controllers, request/response DTOs
   ```
   Register in `app.module.ts`. Export only the application service(s) other
   modules may use.
4. **DB**: entities + migration via skill `typeorm-migration`.
5. **Workflow** (if it has approvals): reuse `service-request` by adding a
   request type via skill `service-request-workflow` — do not build a second FSM.
6. **Legacy**: if replacing a sheet, add it via skill `legacy-sheet-ingestion`.
7. **Web** `apps/web/app/(app)/<module>/`: list page, detail page, nav entry
   gated by role.
8. **Verify**: `pnpm turbo lint typecheck test --filter=...[HEAD]`; boundary lint
   passes (no deep imports into other modules).
