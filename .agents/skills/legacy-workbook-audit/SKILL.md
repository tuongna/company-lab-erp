---
name: legacy-workbook-audit
description: Use this skill to profile and validate a legacy Google Sheets / XLSX export of the IT Operations workbook (Employees, Equipment, Requests, RequestHistory) before designing schemas, writing ingestion mappers, or answering questions about legacy data. Runs a full-coverage audit script and produces a Markdown report.
---

# Legacy workbook audit

The workbook's own `Dashboard` and `DataChecks` sheets are **not trustworthy**
(formula ranges stop at row 40–60; one check is hardcoded). Always use this
script instead of reading those sheets.

## Steps

1. Get an `.xlsx` export (Sheets: File → Download → .xlsx) into `raw/`.
2. Run (stdlib only, no install needed):
   ```bash
   python3 .agents/skills/legacy-workbook-audit/scripts/audit_workbook.py \
     "raw/<file>.xlsx" --out docs/data-audit/<file-slug>-report.md
   ```
   Exit code `1` means at least one FAIL check.
3. Read the report. Triage each non-PASS row:
   - **FAIL** (keys, enums, references, time, asset invariants, FSM) → becomes a
     `QuarantineReason` in the ingestion mapper; never "fix" data silently.
   - **WARN** (workbook formulas) → legacy reporting bug; note it for
     stakeholders, do not migrate the derived sheet.
4. If the domain changed (new request type/status), update the constants at the
   top of [audit_workbook.py](./scripts/audit_workbook.py) **and** the rule
   `domain-glossary` together.
5. Commit the report under `docs/data-audit/` so diffs between exports are reviewable.

## What it checks

Keys unique · enum values · foreign keys (flags numeric values as likely
column shift) · timestamps are serial numbers · Assigned⇔holder ·
≤1 laptop per employee · asset required per request type · every history
transition allowed by the FSM · event chain continuity · request status equals
latest event · formula ranges shorter than data · hardcoded DataChecks results.

## Gotcha

When parsing XLSX by hand, map cells by their column letter (`c.r`), not by
position — sparse rows omit empty cells and positional parsing shifts columns,
producing fake "column shift" findings.
