---
trigger: model_decision
description: Rules for Docker, GitHub Actions CI/CD, and GCP deployment (Cloud Run, Cloud SQL, Cloud Scheduler, Secret Manager). Use when editing Dockerfiles, workflows, infra config, or environment variables.
---

# Infra — Docker, GitHub Actions, GCP

## Runtime topology

| Component                               | GCP service                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `api` (NestJS)                          | Cloud Run service                                               |
| `web` (Next.js, `output: 'standalone'`) | Cloud Run service                                               |
| `migrate`                               | Cloud Run Job (runs `db:migrate`) — executed before api rollout |
| `legacy-sync`                           | Cloud Run Job, triggered by Cloud Scheduler                     |
| Database                                | Cloud SQL PostgreSQL 16, private IP / Cloud SQL connector       |
| Secrets                                 | Secret Manager mounted as env vars                              |

Region: `asia-southeast1` unless told otherwise.

## Docker

- Multi-stage builds with `pnpm deploy --filter <app> --prod` (or turbo prune)
  so each image contains only its app's deps.
- Base `node:22-slim`, run as non-root, `NODE_ENV=production`.
- Listen on `$PORT`; handle `SIGTERM` (Nest `enableShutdownHooks`) for graceful
  Cloud Run shutdown.
- Local dev: `docker compose` provides PostgreSQL 16 (+ Firebase Auth emulator).

## CI/CD (GitHub Actions)

- PR: install (pnpm cache) → lint → typecheck → unit → integration
  (Testcontainers / service container Postgres) → build.
- `main`: build & push images to Artifact Registry (tag = git SHA) →
  run `migrate` job → deploy `api`, `web`, update `legacy-sync` job.
- Auth to GCP via **Workload Identity Federation**; no JSON keys in secrets.
- Migrations must be backward compatible with the currently running revision
  (see database rule: expand → contract).

## Configuration

- All config via env vars validated at boot; document each in `.env.example`.
- Never commit `.env*` (except `.env.example`) or service account keys.
- Least-privilege service accounts per component (api ≠ sync ≠ migrate).

## Observability (on-call shifts depend on it)

- JSON logs with `severity` field for Cloud Logging.
- Health: `/healthz` (liveness), `/readyz` (DB reachable).
- Alerts: sync job failure, quarantine count spike, 5xx rate, Cloud SQL CPU/connections.
