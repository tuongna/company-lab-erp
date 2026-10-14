# Legacy workbook audit

- Source: `raw/IT Operations - Legacy Demo.xlsx`
- Generated: 2026-10-14T11:35:36+07:00
- Result: **PASS** (0 fail, 2 warn, 28 pass)

## Row counts (non-blank)

| Sheet | Rows | Comments |
|---|---:|---:|
| Dashboard | 21 | 0 |
| Employees | 300 | 0 |
| Equipment | 600 | 0 |
| Requests | 8000 | 101 |
| RequestHistory | 29470 | 324 |
| Attachments | 0 | 0 |
| Settings | 8 | 0 |
| DataChecks | 15 | 1 |
| LatestEvents | 8000 | 0 |

Time range (local wall-clock): 2025-04-14 07:00 → 2026-10-14 10:08

## Checks

| Group | Check | Status | Count | Samples |
|---|---|---|---:|---|
| Keys | Employees.employee_id unique & non-empty | ✅ PASS | 0 |  |
| Keys | Equipment.asset_id unique & non-empty | ✅ PASS | 0 |  |
| Keys | Requests.request_id unique & non-empty | ✅ PASS | 0 |  |
| Keys | RequestHistory.event_id unique & non-empty | ✅ PASS | 0 |  |
| Enums | Requests.request_type in allowed set | ✅ PASS | 0 |  |
| Enums | Requests.status in allowed set | ✅ PASS | 0 |  |
| Enums | Equipment.type in allowed set | ✅ PASS | 0 |  |
| Enums | Equipment.status in allowed set | ✅ PASS | 0 |  |
| Enums | Employees.role in allowed set | ✅ PASS | 0 |  |
| Enums | RequestHistory.to_status in allowed set | ✅ PASS | 0 |  |
| Enums | RequestHistory.from_status in allowed set | ✅ PASS | 0 |  |
| References | Requests.employee_id exists | ✅ PASS | 0 |  |
| References | Requests.assigned_to exists | ✅ PASS | 0 |  |
| References | Requests.asset_id exists | ✅ PASS | 0 |  |
| References | RequestHistory.request_id exists | ✅ PASS | 0 |  |
| References | RequestHistory.actor_id exists | ✅ PASS | 0 |  |
| References | Equipment.holder_id exists | ✅ PASS | 0 |  |
| References | Attachments.request_id exists | ✅ PASS | 0 |  |
| Time | Requests.created_at is a date serial | ✅ PASS | 0 |  |
| Time | RequestHistory.occurred_at is a date serial | ✅ PASS | 0 |  |
| Asset | Assigned ⇒ holder present | ✅ PASS | 0 |  |
| Asset | Available ⇒ holder empty | ✅ PASS | 0 |  |
| Asset | ≤ 1 assigned laptop per employee | ✅ PASS | 0 |  |
| Request | asset_id present when required | ✅ PASS | 0 |  |
| History | every transition allowed by FSM | ✅ PASS | 0 |  |
| History | event chain continuous (from = previous to) | ✅ PASS | 0 |  |
| History | request status = latest event | ✅ PASS | 0 |  |
| History | every request has history | ✅ PASS | 0 |  |
| Workbook | formula ranges cover all data rows | ⚠️ WARN | 37 | Dashboard!B10 covers Requests to row 60, data ends at row 8001<br>Dashboard!B11 covers Requests to row 60, data ends at row 8001<br>Dashboard!B12 covers Requests to row 60, data ends at row 8001<br>Dashboard!B13 covers Equipment to row 60, data ends at row 601<br>Dashboard!B14 covers Equipment to row 60, data ends at row 601 |
| Workbook | DataChecks results are formulas (not hardcoded) | ⚠️ WARN | 1 | DataChecks!B14 = '0.0' (Trạng thái lệch sự kiện mới nhất) |

## Requests by type × status

| Type | Status | Count |
|---|---|---:|
| Laptop allocation | Cancelled | 133 |
| Laptop allocation | Completed | 2123 |
| Laptop allocation | In progress | 43 |
| Laptop allocation | Pending approval | 35 |
| Laptop allocation | Rejected | 179 |
| Laptop repair | Cancelled | 122 |
| Laptop repair | Completed | 2697 |
| Laptop repair | In progress | 53 |
| Laptop repair | Pending approval | 59 |
| Laptop repair | Rejected | 287 |
| Laptop return | Cancelled | 113 |
| Laptop return | Completed | 1915 |
| Laptop return | In progress | 39 |
| Laptop return | Pending approval | 41 |
| Laptop return | Rejected | 161 |

## Comment samples

- `Requests!G100`: Synthetic timestamp repair: original serial=46245.70833333333. Reconstructed from generator UTC dates; stored as Vietnam local time.
- `Requests!G67`: Synthetic timestamp repair: original serial=46080.66666666667. Reconstructed from generator UTC dates; stored as Vietnam local time.
- `RequestHistory!F166`: Synthetic timestamp repair: original serial=46010.66666666667. Reconstructed from generator UTC dates; stored as Vietnam local time.
- `RequestHistory!F133`: Synthetic timestamp repair: original serial=46302.70833333333. Reconstructed from generator UTC dates; stored as Vietnam local time.
- `DataChecks!B14`: Temporarily paused during bulk import; restored after verification.
