---
name: service-request-workflow
description: Use this skill when adding or changing a request type (e.g. monitor allocation), a status, a transition, a guard, or a side effect in the service-request workflow FSM, or when debugging an invalid-transition / concurrency bug in it.
---

# Changing the service-request workflow

Read first: `docs/adr/0003-service-request-workflow-fsm.md`, rule `domain-glossary`.

## Where things live

| Piece | Location |
|---|---|
| Status / type enums, transition table, role matrix | `packages/contracts/src/service-request/` |
| Guards & side effects per type | `apps/api/src/modules/service-request/domain/policies/` |
| Transition use case (transaction, locking, history) | `apps/api/src/modules/service-request/application/transition.service.ts` |
| Asset side effects | `asset` module service, called with the same `EntityManager` |

## Steps

1. **Contracts**: add the enum value / transition / role permission. This is
   the single source used by API validation and web action buttons.
2. **Policy**: implement guard (`canTransition(ctx) → ok | DomainError`) and
   effect (`apply(ctx, em)`) for the request type. Effects must only use the
   provided `EntityManager`.
3. **Transition service stays generic** — it must keep this order inside one
   `dataSource.transaction`:
   1. lock request `FOR UPDATE` (and asset if involved)
   2. check `version` from client (optimistic) → 409 if stale
   3. check transition allowed + actor role
   4. run guard → run effect
   5. update status, bump version
   6. insert `request_history` (from, to, actor, occurred_at = now(), note)
   7. (phase B) insert outbox event
4. **DB**: if the rule is an invariant (e.g. one laptop per employee), back it
   with a constraint via skill `typeorm-migration`.
5. **Legacy**: update the mapping table in rule `domain-glossary` and the
   constants in the audit script so ingestion and audit accept the new value.
6. **Tests**:
   - unit: transition table — every (status, role) pair, allowed and denied
   - unit: guard edge cases
   - integration (Testcontainers): happy path end-to-end; constraint violation
     returns 409; **two concurrent completions on the same asset → exactly one
     succeeds** (`Promise.allSettled` on two transactions)
7. Web: nothing to hard-code — actions render from contracts; add label/colour
   for a new status in the status badge map.

## Debugging checklist

- 409 on valid action → stale `version` on client, or another operator acted.
- History missing → someone updated status outside `transition.service` (grep
  for `status:` writes on the request repository).
- Asset/request mismatch → effect ran on a different `EntityManager` (outside tx).
