import { Snapshot, SHEETS, HEADERS, rowsFromValues, Cell } from './source';
export function fixture(): Snapshot {
  const values: Record<string, Cell[][]> = {
    Employees: [
      ['EMP-1', 'Demo', 'IT', 'Employee'],
      ['OP-1', 'Operator', 'IT', 'Operator'],
    ],
    Equipment: [['AST-1', 'Laptop', 'Demo', 'Available', null]],
    Requests: [['REQ-1', 'EMP-1', 'Laptop allocation', 'Pending approval', null, null, 46000]],
    RequestHistory: [['EVT-1', 'REQ-1', null, 'Pending approval', 'EMP-1', 46000, 'Submitted']],
    Attachments: [],
  };
  return {
    source: 'test',
    extractedAt: '2026-10-14T09:00:00Z',
    rows: SHEETS.flatMap((s) => rowsFromValues(s, [[...HEADERS[s]], ...values[s]!])),
  };
}
