---
name: incident-triage
description: Use this skill during on-call shifts or when the user reports a production/staging problem — sync job failed, data mismatch between Google Sheets and the web app, request stuck in a status, asset shown with wrong holder, slow pages, 5xx errors. Provides a root-cause-first triage runbook and diagnostic SQL.
---

# Incident triage (root cause first)

## 1. Frame (2 min)

Write down: symptom, first seen (Asia/Ho_Chi_Minh), scope (one request / one
module / everyone), recent deploys (`gcloud run revisions list --service api`)
and last sync runs. Do not change data before step 3.

## 2. Locate the layer

| Symptom | Start with |
|---|---|
| Web ≠ Sheets | latest `sync_run` report + quarantine table ([diagnostics.sql](./references/diagnostics.sql) §1) |
| Request stuck / wrong status | history for that request (§2), status-vs-latest-event drift (§3) |
| Asset wrong holder / double laptop | asset invariants (§4) |
| 409 storms | concurrent operators, stale client `version` |
| Slow page | `EXPLAIN (ANALYZE, BUFFERS)` on the endpoint query; `pg_stat_statements` (§5) |
| 5xx | Cloud Logging `severity>=ERROR` filtered by `requestId` |

## 3. Root cause

Find the **first** wrong event, not the latest symptom. Ask "why" until you
reach a code path, a data source change (someone edited a protected sheet,
renamed a column), or an infra event. Reproduce with a failing test when it
is a code bug.

## 4. Fix

- Code bug → test + fix + deploy (skill `gcp-cloud-run-deploy`).
- Bad legacy row → fix at the **system of record** for that phase (Sheets in
  phase A), then re-run sync. Never hand-edit PostgreSQL rows that sync owns.
- Data repair in PostgreSQL (phase B+) → a reviewed SQL script in a
  transaction, recorded as a `request_history` note / audit entry.

## 5. Close

Write a short post-incident note in `docs/incidents/YYYY-MM-DD-<slug>.md`:
timeline, root cause, fix, prevention (alert, constraint, test). Explain the
impact to non-technical stakeholders in Vietnamese, without jargon.
