import { Open } from 'unzipper';
import { XMLParser } from 'fast-xml-parser';
import { posix } from 'path';
import { Cell, LegacySource, Snapshot, SHEETS, SourceRow, rowsFromValues } from '../source';

type Node = Record<string, unknown>;
const object = (value: unknown): Node =>
  value && typeof value === 'object' ? (value as Node) : {};
const list = (value: unknown): unknown[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];
function text(value: unknown): string {
  if (typeof value === 'string') return value;
  const node = object(value);
  if ('#text' in node) return String(node['#text']);
  if ('t' in node) return text(node.t);
  if ('r' in node) return list(node.r).map(text).join('');
  return '';
}
/** Read raw XML cell values: no formatting-based Date conversion or positional column shifts. */
export class XlsxFileSource implements LegacySource {
  constructor(private readonly file: string) {}
  async read(): Promise<Snapshot> {
    const zip = await Open.file(this.file);
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: false,
      trimValues: false,
    });
    const xml = async (path: string): Promise<Node> => {
      const entry = zip.files.find((f) => f.path === path);
      if (!entry) throw new Error(`Missing XLSX part ${path}`);
      return object(parser.parse((await entry.buffer()).toString('utf8')));
    };
    const workbook = object((await xml('xl/workbook.xml')).workbook);
    if (['1', 'true'].includes(String(object(workbook.workbookPr)['@_date1904'])))
      throw new Error('1904 date system is not supported');
    const rels = list(
      object((await xml('xl/_rels/workbook.xml.rels')).Relationships).Relationship,
    ).map(object);
    const shared = zip.files.some((f) => f.path === 'xl/sharedStrings.xml')
      ? list(object((await xml('xl/sharedStrings.xml')).sst).si).map(text)
      : [];
    const sheets = list(object(workbook.sheets).sheet).map(object);
    const rows: SourceRow[] = [];
    for (const name of SHEETS) {
      const sheet = sheets.find((s) => s['@_name'] === name);
      const relation = rels.find((r) => r['@_Id'] === sheet?.['@_r:id']);
      if (!sheet || !relation || relation['@_TargetMode'] === 'External')
        throw new Error(`Missing/invalid sheet ${name}`);
      const target = String(relation['@_Target']);
      const path = target.startsWith('/')
        ? target.slice(1)
        : posix.normalize(posix.join('xl', target));
      if (!path.startsWith('xl/worksheets/')) throw new Error(`Invalid sheet target ${name}`);
      const worksheet = object((await xml(path)).worksheet);
      const matrix: Cell[][] = [];
      for (const item of list(object(worksheet.sheetData).row)) {
        const row = object(item);
        const rowNumber = Number(row['@_r']);
        if (!Number.isInteger(rowNumber) || rowNumber < 1 || rowNumber > 100000)
          throw new Error(`Invalid/oversized row in ${name}`);
        while (matrix.length < rowNumber) matrix.push([]);
        const cells = matrix[rowNumber - 1]!;
        for (const item of list(row.c)) {
          const c = object(item);
          const ref = /^([A-Z]+)(\d+)$/.exec(String(c['@_r']));
          if (!ref || Number(ref[2]) !== rowNumber)
            throw new Error(`Invalid cell reference in ${name}`);
          const col = [...ref[1]!].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
          if (col > 99 || c.f !== undefined || c['@_t'] === 'e')
            throw new Error(`Unsupported column/formula/error in ${name}`);
          let value: Cell = null;
          if (c['@_t'] === 's') {
            value = shared[Number(c.v)] ?? null;
            if (value === null) throw new Error('Invalid shared string reference');
          } else if (c['@_t'] === 'inlineStr') value = text(c.is);
          else if (c['@_t'] === 'str') value = String(c.v ?? '');
          else if (c['@_t'] === 'b') value = c.v === '1';
          else if (c.v !== undefined && c.v !== '') {
            value = Number(c.v);
            if (!Number.isFinite(value)) throw new Error(`Invalid numeric cell in ${name}`);
          }
          cells[col] = value;
        }
      }
      rows.push(...rowsFromValues(name, matrix));
    }
    return { source: 'xlsx', extractedAt: new Date().toISOString(), rows };
  }
}
