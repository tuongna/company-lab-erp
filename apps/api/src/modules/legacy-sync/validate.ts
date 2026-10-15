import { REQUEST_TRANSITIONS, QuarantineReason as Reason } from '@companylab/contracts';
import { Snapshot, SourceRow, Sheet, Cell } from './source';

export type RecordValue = string | number | null;
export interface MappedRow {
  source: SourceRow;
  values: Record<string, RecordValue>;
}
export interface Problem {
  source: SourceRow;
  reason: Reason;
  detail: string;
}
const roles: Record<string, string> = {
  Employee: 'EMPLOYEE',
  Manager: 'MANAGER',
  Operator: 'OPERATOR',
  Admin: 'ADMIN',
};
const types: Record<string, string> = {
  'Laptop allocation': 'ALLOCATION',
  'Laptop return': 'RETURN',
  'Laptop repair': 'REPAIR',
};
const statuses: Record<string, string> = {
  'Pending approval': 'PENDING_APPROVAL',
  Approved: 'APPROVED',
  'In progress': 'IN_PROGRESS',
  Completed: 'COMPLETED',
  Rejected: 'REJECTED',
  Cancelled: 'CANCELLED',
};
export const TABLES: Record<Sheet, string> = {
  Employees: 'employee',
  Equipment: 'asset',
  Requests: 'service_request',
  RequestHistory: 'request_history',
  Attachments: 'attachment',
};
class Invalid extends Error {
  constructor(
    readonly reason: Reason,
    detail: string,
  ) {
    super(detail);
  }
}
function text(value: Cell | undefined, field: string, optional = false): string | null {
  if ((value === null || value === undefined || value === '') && optional) return null;
  if (typeof value !== 'string' || !value.trim())
    throw new Invalid(Reason.COLUMN_SHIFT, `Expected text: ${field}`);
  return value.trim();
}
function enumeration(value: Cell | undefined, map: Record<string, string>, field: string): string {
  const result = typeof value === 'string' ? map[value] : undefined;
  if (!result) throw new Invalid(Reason.BAD_ENUM, `Unknown ${field}`);
  return result;
}
export function serialToUtc(value: Cell | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1 || value > 2958465)
    throw new Invalid(Reason.BAD_TIMESTAMP, 'Expected numeric spreadsheet serial');
  return new Date(Math.round((value - 25569) * 86400000) - 7 * 3600000).toISOString();
}
export function validate(snapshot: Snapshot): { rows: MappedRow[]; problems: Problem[] } {
  const rows: MappedRow[] = [];
  const problems: Problem[] = [];
  const ids = new Map<Sheet, Set<string>>();
  const problem = (source: SourceRow, reason: Reason, detail: string) =>
    problems.push({ source, reason, detail });
  for (const source of snapshot.rows) {
    const r = source.raw;
    const t = (key: string, optional = false) => text(r[key], key, optional);
    try {
      let v: Record<string, RecordValue>;
      switch (source.sheet) {
        case 'Employees':
          v = {
            legacy_id: t('employee_id'),
            name: t('name'),
            department: t('department'),
            role: enumeration(r.role, roles, 'role'),
            email: `${t('employee_id')!.toLowerCase()}@demo.local`,
          };
          break;
        case 'Equipment':
          v = {
            legacy_id: t('asset_id'),
            type: enumeration(r.type, { Laptop: 'LAPTOP', Monitor: 'MONITOR' }, 'type'),
            model: t('model'),
            status: enumeration(
              r.status,
              { Available: 'AVAILABLE', Assigned: 'ASSIGNED', Maintenance: 'MAINTENANCE' },
              'status',
            ),
            holder_employee_id: t('holder_id', true),
          };
          break;
        case 'Requests':
          v = {
            legacy_id: t('request_id'),
            employee_id: t('employee_id'),
            request_type: enumeration(r.request_type, types, 'request_type'),
            status: enumeration(r.status, statuses, 'status'),
            assigned_to: t('assigned_to', true),
            asset_id: t('asset_id', true),
            created_at: serialToUtc(r.created_at),
          };
          break;
        case 'RequestHistory':
          v = {
            legacy_id: t('event_id'),
            request_id: t('request_id'),
            from_status:
              r.from_status === null ? null : enumeration(r.from_status, statuses, 'from_status'),
            to_status: enumeration(r.to_status, statuses, 'to_status'),
            actor_id: t('actor_id'),
            occurred_at: serialToUtc(r.occurred_at),
            note: t('note', true),
          };
          break;
        case 'Attachments':
          v = {
            legacy_id: t('attachment_id'),
            request_id: t('request_id'),
            drive_file_id: t('drive_file_id'),
            name: t('name'),
          };
          break;
      }
      const set = ids.get(source.sheet) ?? new Set<string>();
      ids.set(source.sheet, set);
      const id = String(v.legacy_id);
      if (set.has(id)) throw new Invalid(Reason.DUPLICATE_KEY, 'Duplicate legacy business key');
      set.add(id);
      rows.push({ source, values: v });
    } catch (error) {
      if (!(error instanceof Invalid)) throw error;
      problem(source, error.reason, error.message);
    }
  }
  const bySheet = (sheet: Sheet) => rows.filter((r) => r.source.sheet === sheet);
  const fk = (row: MappedRow, field: string, sheet: Sheet) => {
    const id = row.values[field];
    if (id !== null && !ids.get(sheet)?.has(String(id)))
      problem(row.source, Reason.MISSING_FK, `${field} not found in ${sheet}`);
  };
  const holders = new Set<string>();
  for (const row of bySheet('Equipment')) {
    fk(row, 'holder_employee_id', 'Employees');
    const v = row.values;
    if (
      (v.status === 'ASSIGNED' && !v.holder_employee_id) ||
      (v.status === 'AVAILABLE' && v.holder_employee_id)
    )
      problem(row.source, Reason.POLICY_VIOLATION, 'Asset holder/status mismatch');
    if (v.type === 'LAPTOP' && v.status === 'ASSIGNED' && v.holder_employee_id) {
      const holder = String(v.holder_employee_id);
      if (holders.has(holder))
        problem(row.source, Reason.POLICY_VIOLATION, 'More than one assigned laptop');
      holders.add(holder);
    }
  }
  const history = new Map<string, MappedRow[]>();
  for (const row of bySheet('RequestHistory')) {
    fk(row, 'request_id', 'Requests');
    fk(row, 'actor_id', 'Employees');
    const key = String(row.values.request_id);
    const group = history.get(key) ?? [];
    group.push(row);
    history.set(key, group);
  }
  for (const row of bySheet('Requests')) {
    fk(row, 'employee_id', 'Employees');
    fk(row, 'assigned_to', 'Employees');
    fk(row, 'asset_id', 'Equipment');
    const v = row.values;
    if ((v.request_type !== 'ALLOCATION' || v.status === 'COMPLETED') && !v.asset_id)
      problem(row.source, Reason.POLICY_VIOLATION, 'Asset required for request');
    const events = (history.get(String(v.legacy_id)) ?? []).sort(
      (a, b) =>
        String(a.values.occurred_at).localeCompare(String(b.values.occurred_at)) ||
        a.source.rowNumber - b.source.rowNumber,
    );
    let state: RecordValue = null;
    for (const event of events) {
      const h = event.values;
      if (
        h.from_status !== state ||
        !REQUEST_TRANSITIONS.some(
          (rule) => rule.from === h.from_status && rule.to === h.to_status,
        ) ||
        String(h.occurred_at) < String(v.created_at)
      )
        problem(
          event.source,
          Reason.INVALID_TRANSITION,
          'Broken history chain, transition or timestamp',
        );
      state = h.to_status ?? null;
    }
    if (state !== v.status)
      problem(
        row.source,
        Reason.INVALID_TRANSITION,
        'Request status differs from latest history (or history missing)',
      );
  }
  for (const row of bySheet('Attachments')) fk(row, 'request_id', 'Requests');
  return { rows, problems };
}
