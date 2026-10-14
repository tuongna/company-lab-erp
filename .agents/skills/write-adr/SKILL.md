---
name: write-adr
description: Use this skill when a decision changes architecture, data flow, migration phase, security, or contradicts an existing ADR in docs/adr — or when the user asks to document a technical decision.
---

# Writing an ADR

1. Next number: `ls docs/adr | sort | tail -1` → increment (4 digits).
2. File: `docs/adr/NNNN-kebab-title.md`, using the template below.
3. Keep it short: context with **measured facts** (counts, quotas, benchmarks),
   one decision, consequences (including the bad ones).
4. Superseding: set old ADR status to `Superseded by NNNN`, never delete it.
5. Add a row to the ADR table in `README.md` and, if it is a non-negotiable,
   to `AGENTS.md`.
6. Commit: `docs(adr): NNNN <title>`.

## Template

```markdown
# ADR-NNNN: <Decision as a statement>

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context
<forces, constraints, data>

## Decision
<what we do, specific enough to review code against>

## Consequences
<positive, negative, follow-ups>
```
