# ADR-0003: Code-defined workflow FSM shared by all request types

- Status: Accepted
- Date: 2026-10-14

## Context

Transition matrix measured from legacy `RequestHistory` (29,470 events,
8,000 requests) shows all three request types follow the **same lifecycle**:

```
∅ → Pending approval → Approved → In progress → Completed
          ├→ Rejected
          └→ Cancelled
```

| Type              | Requests | Asset reference                                            |
| ----------------- | -------- | ---------------------------------------------------------- |
| Laptop repair     | 3,218    | set at creation (employee's current laptop)                |
| Laptop allocation | 2,513    | set only on Completed (operator picks an Available laptop) |
| Laptop return     | 2,269    | set at creation (employee's current laptop)                |

Legacy writes `Requests.status` and `RequestHistory` separately
("Trạng thái không tự tạo lịch sử"), which causes drift that the sheet
`LatestEvents` tries to detect.

## Decision

1. One FSM definition in code (typed transition table), not a DB/BPMN engine.
   Request types differ only through **guards** and **side effects**:
   - `allocation` → on Completed: assign asset (Available → Assigned, set holder).
     Guard: employee holds no laptop (policy: max one laptop per employee).
   - `return` → on Completed: release asset (Assigned → Available, clear holder).
     Guard: asset is held by the requester.
   - `repair` → no asset status change in v1 (mirrors legacy). An `IN_REPAIR`
     asset state is a candidate for a later ADR.
2. Each transition runs in **one DB transaction**: lock request row
   (`SELECT … FOR UPDATE`), validate transition + role, apply side effects,
   update status, insert history row. Status and history can no longer drift.
3. Role permissions: Employee creates/cancels own; Manager approves/rejects;
   Operator moves Approved → In progress → Completed.
4. Allowed transitions are exported from `packages/contracts` so the web UI
   renders only valid actions.

## Consequences

- Adding a type (e.g. monitor allocation) = new guard/effect set, no new FSM.
- DB constraints back the guards (see ADR-0004) so races between two operators
  fail safely.
