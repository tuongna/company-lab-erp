---
trigger: model_decision
description: Domain vocabulary and business rules for IT asset requests (allocation, return, repair). Use when naming entities, writing workflow logic, mapping legacy columns, or explaining behaviour to stakeholders.
---

# Domain glossary — IT Asset Allocation

## Entities

| Term | Legacy sheet / column | New model | Notes |
|---|---|---|---|
| Employee | `Employees` | `organization.employee` | `role`: Employee, Manager, Operator. Legacy has no email (ADR-0005). |
| Asset | `Equipment` | `asset.asset` | `type`: LAPTOP, MONITOR. `status`: AVAILABLE, ASSIGNED. `holder_id` → `holder_employee_id`. |
| Service request | `Requests` | `service_request.service_request` | `request_type`: allocation, return, repair. |
| Request history | `RequestHistory` | `service_request.request_history` | Append-only audit trail of transitions. |
| Attachment | `Attachments` | `service_request.attachment` | `drive_file_id` → Google Drive file. |
| Setting | `Settings` | config / env | Not migrated as data. |

Legacy derived sheets `Dashboard`, `DataChecks`, `LatestEvents` are **not**
migrated; the new system computes these from core tables.

## Value mapping (legacy → enum)

| Legacy | Enum |
|---|---|
| `Laptop allocation` / `Laptop return` / `Laptop repair` | `ALLOCATION` / `RETURN` / `REPAIR` |
| `Pending approval` | `PENDING_APPROVAL` |
| `Approved` / `In progress` / `Completed` | `APPROVED` / `IN_PROGRESS` / `COMPLETED` |
| `Rejected` / `Cancelled` | `REJECTED` / `CANCELLED` |
| `Available` / `Assigned` | `AVAILABLE` / `ASSIGNED` |

## Lifecycle (all request types)

```
(new) → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETED
               ├→ REJECTED   (Manager)
               └→ CANCELLED  (requester)
```

| Transition | Actor role |
|---|---|
| create → PENDING_APPROVAL | Employee (requester) |
| PENDING_APPROVAL → APPROVED / REJECTED | Manager |
| PENDING_APPROVAL → CANCELLED | Requester |
| APPROVED → IN_PROGRESS → COMPLETED | Operator |

## Business rules

- **One laptop per employee**: at most one ASSIGNED laptop per holder.
- **Allocation**: asset is chosen by the Operator at completion; asset must be
  AVAILABLE; on COMPLETED → asset ASSIGNED to requester.
- **Return**: asset referenced at creation, must be held by requester;
  on COMPLETED → asset AVAILABLE, holder cleared.
- **Repair**: asset referenced at creation; no asset status change (v1).
- ASSIGNED ⇔ holder present; AVAILABLE ⇔ holder empty.
- Terminal states (COMPLETED, REJECTED, CANCELLED) accept no transitions.

## Legacy ID prefixes

`REQ-`, `G-REQ-`, `H-REQ-`, `EMP-`, `H-EMP-`, `AST-`, `H-AST-`, `EVT-`, UUID.
Keep them verbatim in `legacy_id`; never parse meaning from prefixes.
