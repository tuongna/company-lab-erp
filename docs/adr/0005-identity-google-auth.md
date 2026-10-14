# ADR-0005: Identity via Firebase Authentication (Google provider)

- Status: Accepted
- Date: 2026-10-14

## Context

Users already work in Google Workspace (Sheets/Drive). Legacy `Employees` has
no email column, so a Google account cannot be linked to an employee.

## Decision

- Add an `email` column to legacy `Employees` (legacy evolves in parallel).
  For the synthetic seed, derive `<employee_id lowercased>@demo.local`.
- Web signs in with Firebase Auth (Google provider; restrict to company
  domain in production). API verifies the Firebase ID token with
  `firebase-admin`, resolves `employee` by email, and loads the role.
- Local development uses the Firebase Auth Emulator, plus a dev-only
  "sign in as" switch guarded by `NODE_ENV !== 'production'`.
- Authorization (RBAC: Employee / Manager / Operator, later Admin) lives in the
  API, never in the token's custom claims alone.

## Consequences

- No passwords stored by us.
- Unknown emails get a 403 with an onboarding message instead of auto-creating
  employees.
