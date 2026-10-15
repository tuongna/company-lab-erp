import { fixture } from './fixtures';
import { validate, serialToUtc } from './validate';
import { rowsFromValues } from './source';

describe('Legacy validation', () => {
  it('accepts a coherent snapshot and explicitly converts Vietnam serial time', () => {
    expect(validate(fixture()).problems).toEqual([]);
    expect(serialToUtc(25569)).toBe('1969-12-31T17:00:00.000Z');
  });
  it.each(['request_type', 'status'])('quarantines unknown %s instead of defaulting', (field) => {
    const f = fixture();
    f.rows.find((r) => r.sheet === 'Requests')!.raw[field] = 'unknown';
    expect(validate(f).problems.some((p) => p.reason === 'BAD_ENUM')).toBe(true);
  });
  it.each(['assigned_to', 'asset_id'])('does not discard unknown %s', (field) => {
    const f = fixture();
    f.rows.find((r) => r.sheet === 'Requests')!.raw[field] = 'missing';
    expect(validate(f).problems.some((p) => p.reason === 'MISSING_FK')).toBe(true);
  });
  it.each([null, '46000oops', '2026-10-14', NaN])('rejects invalid timestamp %s', (v) => {
    expect(() => serialToUtc(v)).toThrow();
  });
  it('detects duplicates and request-history drift', () => {
    const f = fixture();
    f.rows.push(f.rows[0]!);
    f.rows.find((r) => r.sheet === 'Requests')!.raw.status = 'Completed';
    const reasons = validate(f).problems.map((p) => p.reason);
    expect(reasons).toContain('DUPLICATE_KEY');
    expect(reasons).toContain('INVALID_TRANSITION');
  });
  it('preserves sparse row numbers and maps reordered headers', () => {
    const rows = rowsFromValues('Employees', [
      ['role', 'name', 'employee_id', 'department'],
      [],
      ['Employee', 'Demo', 'EMP-1', 'IT'],
    ]);
    expect(rows[0]?.rowNumber).toBe(3);
    expect(rows[0]?.raw.employee_id).toBe('EMP-1');
  });
  it('rejects absent or duplicate headers rather than importing an empty table', () => {
    expect(() => rowsFromValues('Employees', [])).toThrow();
    expect(() =>
      rowsFromValues('Employees', [['employee_id', 'name', 'department', 'role', 'role']]),
    ).toThrow();
  });
});
