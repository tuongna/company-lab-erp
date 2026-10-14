import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import * as unzipper from 'unzipper';
import {
  AssetStatus,
  AssetType,
  ServiceRequestStatus,
  ServiceRequestType,
  UserRole,
} from '@clt/contracts';

@Injectable()
export class ExcelIngestionService {
  private readonly logger = new Logger(ExcelIngestionService.name);

  constructor(private readonly dataSource: DataSource) {}

  // Convert Excel serial date to UTC Date
  private excelSerialToDate(serial: number): Date {
    // Excel epoch begins Dec 30 1899
    const msPerDay = 86400000;
    const epochMs = new Date(Date.UTC(1899, 11, 30)).getTime();
    // In legacy data, serial date represents Asia/Ho_Chi_Minh local wall-clock (UTC+7)
    const localMs = epochMs + serial * msPerDay;
    // Shift -7 hours to get exact UTC instant
    return new Date(localMs - 7 * 3600 * 1000);
  }

  async ingestLegacyFile(filePath: string) {
    this.logger.log(`Starting ingestion from: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const directory = await unzipper.Open.file(filePath);
    const parser = new XMLParser({ ignoreAttributes: false });

    // 1. Read shared strings
    let sharedStrings: string[] = [];
    const ssFile = directory.files.find((f) => f.path === 'xl/sharedStrings.xml');
    if (ssFile) {
      const content = (await ssFile.buffer()).toString('utf8');
      const parsed = parser.parse(content);
      const siList = Array.isArray(parsed.sst?.si) ? parsed.sst.si : [parsed.sst?.si];
      sharedStrings = siList.map((si: any) => {
        if (!si) return '';
        if (typeof si.t === 'string') return si.t;
        if (si.t?.['#text']) return si.t['#text'];
        if (Array.isArray(si.r)) {
          return si.r.map((r: any) => r.t || r.t?.['#text'] || '').join('');
        }
        return '';
      });
    }

    // 2. Read workbook relationships
    const relsFile = directory.files.find((f) => f.path === 'xl/_rels/workbook.xml.rels');
    const relsContent = (await relsFile!.buffer()).toString('utf8');
    const relsParsed = parser.parse(relsContent);
    const relList = Array.isArray(relsParsed.Relationships?.Relationship)
      ? relsParsed.Relationships.Relationship
      : [relsParsed.Relationships?.Relationship];
    const relMap = new Map<string, string>();
    relList.forEach((r: any) => {
      relMap.set(r['@_Id'], r['@_Target']);
    });

    // 3. Read sheet names & targets
    const wbFile = directory.files.find((f) => f.path === 'xl/workbook.xml');
    const wbContent = (await wbFile!.buffer()).toString('utf8');
    const wbParsed = parser.parse(wbContent);
    const sheetEntries = Array.isArray(wbParsed.workbook?.sheets?.sheet)
      ? wbParsed.workbook.sheets.sheet
      : [wbParsed.workbook?.sheets?.sheet];

    const sheetTargets = new Map<string, string>();
    sheetEntries.forEach((s: any) => {
      const name = s['@_name'];
      const rId = s['@_r:id'];
      let target = relMap.get(rId) || '';
      if (!target.startsWith('xl/')) target = 'xl/' + target.replace(/^\//, '');
      sheetTargets.set(name, target);
    });

    const parseSheetRows = async (sheetName: string): Promise<Record<string, string>[]> => {
      const target = sheetTargets.get(sheetName);
      if (!target) return [];
      const file = directory.files.find((f) => f.path === target);
      if (!file) return [];

      const xml = (await file.buffer()).toString('utf8');
      const parsed = parser.parse(xml);
      const rows = Array.isArray(parsed.worksheet?.sheetData?.row)
        ? parsed.worksheet.sheetData.row
        : parsed.worksheet?.sheetData?.row
          ? [parsed.worksheet.sheetData.row]
          : [];

      if (rows.length === 0) return [];

      // Extract header from row 1
      const headerRow = rows[0];
      const headerCells = Array.isArray(headerRow.c) ? headerRow.c : [headerRow.c];
      const colToHeader = new Map<string, string>();

      headerCells.forEach((c: any) => {
        if (!c) return;
        const colLetter = c['@_r'].replace(/[0-9]/g, '');
        let val = '';
        if (c['@_t'] === 's' && c.v !== undefined) {
          val = sharedStrings[parseInt(c.v, 10)] || '';
        } else if (c.v !== undefined) {
          val = String(c.v);
        }
        colToHeader.set(colLetter, val.trim());
      });

      const records: Record<string, string>[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;
        const cells = Array.isArray(row.c) ? row.c : row.c ? [row.c] : [];
        const record: Record<string, string> = {};
        cells.forEach((c: any) => {
          if (!c) return;
          const colLetter = c['@_r'].replace(/[0-9]/g, '');
          const headerName = colToHeader.get(colLetter);
          if (!headerName) return;
          let val = '';
          if (c['@_t'] === 's' && c.v !== undefined) {
            val = sharedStrings[parseInt(c.v, 10)] || '';
          } else if (c.v !== undefined) {
            val = String(c.v);
          }
          record[headerName] = val.trim();
        });
        if (Object.values(record).some((v) => v !== '')) {
          records.push(record);
        }
      }
      return records;
    };

    // 4. Ingest sequentially inside a single transaction
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // Create sync run record
      const syncRunResult = await qr.query(
        `INSERT INTO legacy_sync.sync_run (started_at, status) VALUES (now(), 'RUNNING') RETURNING id`,
      );
      const syncRunId = syncRunResult[0].id;

      // 4.1 Ingest Employees
      const rawEmployees = await parseSheetRows('Employees');
      this.logger.log(`Parsed ${rawEmployees.length} employees`);
      const employeeIdMap = new Map<string, string>(); // legacy_id -> uuid

      for (const r of rawEmployees) {
        const legacyId = r['employee_id'];
        if (!legacyId) continue;
        const name = r['name'] || 'Unknown';
        const department = r['department'] || 'General';
        const role = (r['role']?.toUpperCase() as UserRole) || UserRole.EMPLOYEE;
        const email = `${legacyId.toLowerCase()}@demo.local`;

        const res = await qr.query(
          `INSERT INTO employee (legacy_id, name, department, role, email)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (legacy_id) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department, role = EXCLUDED.role
           RETURNING id`,
          [legacyId, name, department, role, email],
        );
        employeeIdMap.set(legacyId, res[0].id);
      }

      // 4.2 Ingest Equipment
      const rawEquipment = await parseSheetRows('Equipment');
      this.logger.log(`Parsed ${rawEquipment.length} assets`);
      const assetIdMap = new Map<string, string>(); // legacy_id -> uuid

      for (const r of rawEquipment) {
        const legacyId = r['asset_id'];
        if (!legacyId) continue;
        const type = (r['type']?.toUpperCase() as AssetType) || AssetType.LAPTOP;
        const model = r['model'] || 'Unknown Model';
        const status = (r['status']?.toUpperCase() as AssetStatus) || AssetStatus.AVAILABLE;
        const holderLegacyId = r['holder_id'];
        const holderId = holderLegacyId ? employeeIdMap.get(holderLegacyId) || null : null;

        const res = await qr.query(
          `INSERT INTO asset (legacy_id, type, model, status, holder_employee_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (legacy_id) DO UPDATE SET status = EXCLUDED.status, holder_employee_id = EXCLUDED.holder_employee_id
           RETURNING id`,
          [legacyId, type, model, status, holderId],
        );
        assetIdMap.set(legacyId, res[0].id);
      }

      // 4.3 Ingest Requests
      const rawRequests = await parseSheetRows('Requests');
      this.logger.log(`Parsed ${rawRequests.length} requests`);
      const requestIdMap = new Map<string, string>();

      for (const r of rawRequests) {
        const legacyId = r['request_id'];
        const empLegacy = r['employee_id'];
        if (!legacyId || !empLegacy) continue;
        const employeeId = employeeIdMap.get(empLegacy);
        if (!employeeId) continue;

        let requestType = ServiceRequestType.ALLOCATION;
        if (r['request_type'] === 'Laptop return') requestType = ServiceRequestType.RETURN;
        if (r['request_type'] === 'Laptop repair') requestType = ServiceRequestType.REPAIR;

        let status = ServiceRequestStatus.PENDING_APPROVAL;
        const s = r['status'];
        if (s === 'Approved') status = ServiceRequestStatus.APPROVED;
        if (s === 'In progress') status = ServiceRequestStatus.IN_PROGRESS;
        if (s === 'Completed') status = ServiceRequestStatus.COMPLETED;
        if (s === 'Rejected') status = ServiceRequestStatus.REJECTED;
        if (s === 'Cancelled') status = ServiceRequestStatus.CANCELLED;

        const assignedLegacy = r['assigned_to'];
        const assignedTo = assignedLegacy ? employeeIdMap.get(assignedLegacy) || null : null;

        const assetLegacy = r['asset_id'];
        const assetId = assetLegacy ? assetIdMap.get(assetLegacy) || null : null;

        const createdDate = r['created_at'] ? this.excelSerialToDate(parseFloat(r['created_at'])) : new Date();

        const res = await qr.query(
          `INSERT INTO service_request (legacy_id, employee_id, request_type, status, assigned_to, asset_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
           ON CONFLICT (legacy_id) DO UPDATE SET status = EXCLUDED.status, assigned_to = EXCLUDED.assigned_to, asset_id = EXCLUDED.asset_id
           RETURNING id`,
          [legacyId, employeeId, requestType, status, assignedTo, assetId, createdDate],
        );
        requestIdMap.set(legacyId, res[0].id);
      }

      // 4.4 Ingest RequestHistory (Batched)
      const rawHistory = await parseSheetRows('RequestHistory');
      this.logger.log(`Parsed ${rawHistory.length} history events. Inserting in batches...`);

      const batchSize = 1000;
      for (let i = 0; i < rawHistory.length; i += batchSize) {
        const batch = rawHistory.slice(i, i + batchSize);
        const values: any[] = [];
        const placeholders: string[] = [];
        let pIndex = 1;

        for (const h of batch) {
          const legacyId = h['event_id'];
          const reqLegacy = h['request_id'];
          const actorLegacy = h['actor_id'];
          if (!legacyId || !reqLegacy || !actorLegacy) continue;

          const requestId = requestIdMap.get(reqLegacy);
          const actorId = employeeIdMap.get(actorLegacy);
          if (!requestId || !actorId) continue;

          const toStatus = h['to_status'] ? (h['to_status'].toUpperCase().replace(/\s+/g, '_') as ServiceRequestStatus) : ServiceRequestStatus.PENDING_APPROVAL;
          const fromStatus = h['from_status'] ? (h['from_status'].toUpperCase().replace(/\s+/g, '_') as ServiceRequestStatus) : null;
          const occurredAt = h['occurred_at'] ? this.excelSerialToDate(parseFloat(h['occurred_at'])) : new Date();
          const note = h['note'] || null;

          placeholders.push(`($${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++})`);
          values.push(legacyId, requestId, fromStatus, toStatus, actorId, occurredAt, note);
        }

        if (placeholders.length > 0) {
          await qr.query(
            `INSERT INTO request_history (legacy_id, request_id, from_status, to_status, actor_id, occurred_at, note)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT (legacy_id) DO NOTHING`,
            values,
          );
        }
      }

      // Update sync run stats
      await qr.query(
        `UPDATE legacy_sync.sync_run
         SET status = 'COMPLETED', finished_at = now(), source_rows = $1, upserted = $2
         WHERE id = $3`,
        [rawRequests.length + rawEquipment.length + rawEmployees.length, rawRequests.length, syncRunId],
      );

      await qr.commitTransaction();
      this.logger.log('Legacy ingestion completed successfully!');
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error('Failed to ingest legacy file', err);
      throw err;
    } finally {
      await qr.release();
    }
  }
}
