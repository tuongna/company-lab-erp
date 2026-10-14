---
trigger: model_decision
description: Conventions for the Next.js frontend (apps/web) — App Router, data fetching, auth, contracts, timezone display, UI states. Use when writing or reviewing frontend code.
---

# Frontend — Next.js (App Router)

## Structure

- `app/(auth)/...` sign-in; `app/(app)/...` authenticated area with layout
  holding nav + role-aware menu.
- Route groups per module: `requests/`, `assets/`, `admin/sync/`.
- Server Components by default; `"use client"` only for interactivity
  (forms, dialogs, optimistic actions).
- API calls go through one typed client generated from / typed by
  `packages/contracts` (OpenAPI or zod). No hand-written fetch with
  untyped JSON in components.

## Data & mutations

- Reads: server-side fetch with the user's Firebase ID token forwarded to
  the API; client-side lists use TanStack Query with keys `[module, resource, params]`.
- Mutations: call API, then invalidate affected queries. Handle **409**
  (invalid transition / stale version) by refetching and showing a clear message —
  another operator may have acted first.
- Render workflow actions **only from the allowed-transitions list** for the
  current status + role (from contracts). The API remains the authority.

## Time & locale

- API returns UTC ISO strings. Display in `Asia/Ho_Chi_Minh` using
  `Intl.DateTimeFormat` with explicit `timeZone`. Never `new Date().toString()`.
- UI text Vietnamese-first; keep strings in one place to allow i18n later.

## UX requirements

- Every data view has loading, empty, and error states.
- Status shown as a consistent badge (one mapping from enum → label/colour).
- Request detail shows a timeline built from `request_history`.
- Tables: server-side pagination, filters synced to URL search params.
- Accessible: labelled form controls, keyboard-reachable dialogs, visible focus.
