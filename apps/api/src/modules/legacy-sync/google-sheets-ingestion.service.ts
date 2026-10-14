import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { google } from 'googleapis';
import {
  AssetStatus,
  AssetType,
  QuarantineReason,
  ServiceRequestStatus,
  ServiceRequestType,
  UserRole,
} from '@companylab/contracts';

@Injectable()
export class GoogleSheetsIngestionService {
  private readonly logger = new Logger(GoogleSheetsIngestionService.name);

  constructor(private readonly dataSource: DataSource) {}

  private resolveKeyPath(): string {
    const customPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const candidates = [
      customPath ? path.resolve(process.cwd(), customPath) : null,
      path.resolve(process.cwd(), 'credentials/google-service-account.json'),
      path.resolve(process.cwd(), '../../credentials/google-service-account.json'),
      path.resolve(__dirname, '../../../../credentials/google-service-account.json'),
    ].filter(Boolean) as string[];

    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    throw new Error(
      `Google Service Account credentials not found. Checked locations:\n${candidates.join('\n')}`,
    );
  }

  // Quarantine row helper to prevent silent drops (ADR-0001, ADR-0004)
  private async quarantineRow(
    qr: any,
    syncRunId: string,
    sheet: string,
    rowNumber: number | null,
    legacyId: string | null,
    reason: QuarantineReason,
    raw: Record<string, any>,
  ): Promise<void> {
    await qr.query(
      `INSERT INTO legacy_sync.quarantine (sync_run_id, sheet, row_number, legacy_id, reason, raw)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [syncRunId, sheet, rowNumber, legacyId, reason, JSON.stringify(raw)],
    );
  }

  // Convert Google Sheets serial date (Asia/Ho_Chi_Minh wall-clock) to UTC Date
  private sheetSerialToUtcDate(val: any): Date {
    if (typeof val === 'number') {
      const msPerDay = 86400000;
      const epochMs = new Date(Date.UTC(1899, 11, 30)).getTime();
      const localMs = epochMs + val * msPerDay;
      return new Date(localMs - 7 * 3600 * 1000);
    }
    if (typeof val === 'string' && !isNaN(Number(val))) {
      return this.sheetSerialToUtcDate(Number(val));
    }
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
    return new Date();
  }

  private parseRowsToRecords(values?: any[][]): Record<string, any>[] {
    if (!values || values.length < 2 || !values[0]) return [];
    const headers = values[0].map((h) => String(h || '').trim());
    const records: Record<string, any>[] = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row || row.length === 0) continue;
      const record: Record<string, any> = {};
      let hasData = false;
      headers.forEach((h, colIdx) => {
        const cell = row[colIdx];
        if (cell !== undefined && cell !== null && String(cell).trim() !== '') {
          hasData = true;
          record[h] = typeof cell === 'string' ? cell.trim() : cell;
        } else {
          record[h] = '';
        }
      });
      if (hasData) {
        records.push(record);
      }
    }
    return records;
  }

  async ingestFromGoogleSheets(spreadsheetId?: string) {
    const targetSpreadsheetId =
      spreadsheetId ||
      process.env.LEGACY_SPREADSHEET_ID ||
      '1-ADW3SxNi_ailWvrOUMso8wg8Gga4hVIqvNdq6bws1I';

    const keyFile = this.resolveKeyPath();
    this.logger.log(`Starting ingestion from Google Sheets ID: ${targetSpreadsheetId}`);
    this.logger.log(`Using Service Account credentials: ${keyFile}`);

    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    this.logger.log(
      'Fetching sheets batch data: Employees, Equipment, Requests, RequestHistory...',
    );
    const ranges = ['Employees!A1:Z', 'Equipment!A1:Z', 'Requests!A1:Z', 'RequestHistory!A1:Z'];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: targetSpreadsheetId,
      ranges,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'SERIAL_NUMBER',
    });

    const valueRanges = response.data.valueRanges || [];
    const sheetDataMap = new Map<string, any[][]>();
    for (const vr of valueRanges) {
      const sheetName = vr.range?.split('!')[0]?.replace(/'/g, '') || '';
      sheetDataMap.set(sheetName, vr.values || []);
    }

    const rawEmployees = this.parseRowsToRecords(sheetDataMap.get('Employees'));
    const rawEquipment = this.parseRowsToRecords(sheetDataMap.get('Equipment'));
    const rawRequests = this.parseRowsToRecords(sheetDataMap.get('Requests'));
    const rawHistory = this.parseRowsToRecords(sheetDataMap.get('RequestHistory'));

    this.logger.log(
      `Extracted: ${rawEmployees.length} employees, ${rawEquipment.length} assets, ${rawRequests.length} requests, ${rawHistory.length} history events`,
    );

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const syncRunResult = await qr.query(
        `INSERT INTO legacy_sync.sync_run (started_at, status) VALUES (now(), 'RUNNING') RETURNING id`,
      );
      const syncRunId = syncRunResult[0].id;

      let quarantinedCount = 0;
      let upsertedCount = 0;

      // 1. Ingest Employees
      const employeeIdMap = new Map<string, string>(); // legacy_id -> uuid
      for (let i = 0; i < rawEmployees.length; i++) {
        const r = rawEmployees[i];
        if (!r) continue;
        const rowNumber = i + 2;
        const legacyId = r['employee_id'];
        if (!legacyId) {
          await this.quarantineRow(
            qr,
            syncRunId,
            'Employees',
            rowNumber,
            null,
            QuarantineReason.COLUMN_SHIFT,
            r,
          );
          quarantinedCount++;
          continue;
        }

        const name = r['name'] || 'Unknown';
        const department = r['department'] || 'General';
        const role = (String(r['role'] || '').toUpperCase() as UserRole) || UserRole.EMPLOYEE;
        const email = `${String(legacyId).toLowerCase()}@demo.local`;

        const res = await qr.query(
          `INSERT INTO employee (legacy_id, name, department, role, email)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (legacy_id) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department, role = EXCLUDED.role
           RETURNING id`,
          [legacyId, name, department, role, email],
        );
        employeeIdMap.set(legacyId, res[0].id);
        upsertedCount++;
      }

      // 2. Ingest Equipment
      const assetIdMap = new Map<string, string>(); // legacy_id -> uuid
      for (let i = 0; i < rawEquipment.length; i++) {
        const r = rawEquipment[i];
        if (!r) continue;
        const rowNumber = i + 2;
        const legacyId = r['asset_id'];
        if (!legacyId) {
          await this.quarantineRow(
            qr,
            syncRunId,
            'Equipment',
            rowNumber,
            null,
            QuarantineReason.COLUMN_SHIFT,
            r,
          );
          quarantinedCount++;
          continue;
        }

        const type = (String(r['type'] || '').toUpperCase() as AssetType) || AssetType.LAPTOP;
        const model = r['model'] || 'Unknown Model';
        const status =
          (String(r['status'] || '').toUpperCase() as AssetStatus) || AssetStatus.AVAILABLE;
        const holderLegacyId = r['holder_id'];
        let holderId: string | null = null;

        if (holderLegacyId) {
          holderId = employeeIdMap.get(holderLegacyId) || null;
          if (!holderId) {
            await this.quarantineRow(
              qr,
              syncRunId,
              'Equipment',
              rowNumber,
              legacyId,
              QuarantineReason.MISSING_FK,
              r,
            );
            quarantinedCount++;
            continue;
          }
        }

        const res = await qr.query(
          `INSERT INTO asset (legacy_id, type, model, status, holder_employee_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (legacy_id) DO UPDATE SET status = EXCLUDED.status, holder_employee_id = EXCLUDED.holder_employee_id
           RETURNING id`,
          [legacyId, type, model, status, holderId],
        );
        assetIdMap.set(legacyId, res[0].id);
        upsertedCount++;
      }

      // 3. Ingest Requests
      const requestIdMap = new Map<string, string>(); // legacy_id -> uuid
      for (let i = 0; i < rawRequests.length; i++) {
        const r = rawRequests[i];
        if (!r) continue;
        const rowNumber = i + 2;
        const legacyId = r['request_id'];
        const empLegacy = r['employee_id'];
        if (!legacyId) {
          await this.quarantineRow(
            qr,
            syncRunId,
            'Requests',
            rowNumber,
            null,
            QuarantineReason.COLUMN_SHIFT,
            r,
          );
          quarantinedCount++;
          continue;
        }

        const employeeId = empLegacy ? employeeIdMap.get(empLegacy) : null;
        if (!employeeId) {
          await this.quarantineRow(
            qr,
            syncRunId,
            'Requests',
            rowNumber,
            legacyId,
            QuarantineReason.MISSING_FK,
            r,
          );
          quarantinedCount++;
          continue;
        }

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

        const createdDate = r['created_at']
          ? this.sheetSerialToUtcDate(r['created_at'])
          : new Date();

        const res = await qr.query(
          `INSERT INTO service_request (legacy_id, employee_id, request_type, status, assigned_to, asset_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
           ON CONFLICT (legacy_id) DO UPDATE SET status = EXCLUDED.status, assigned_to = EXCLUDED.assigned_to, asset_id = EXCLUDED.asset_id
           RETURNING id`,
          [legacyId, employeeId, requestType, status, assignedTo, assetId, createdDate],
        );
        requestIdMap.set(legacyId, res[0].id);
        upsertedCount++;
      }

      // 4. Ingest RequestHistory (Batched)
      this.logger.log(`Parsed ${rawHistory.length} history events. Inserting in batches...`);
      const batchSize = 1000;
      for (let i = 0; i < rawHistory.length; i += batchSize) {
        const batch = rawHistory.slice(i, i + batchSize);
        const values: any[] = [];
        const placeholders: string[] = [];
        let pIndex = 1;

        for (let j = 0; j < batch.length; j++) {
          const h = batch[j];
          if (!h) continue;
          const rowNumber = i + j + 2;
          const legacyId = h['event_id'];
          const reqLegacy = h['request_id'];
          const actorLegacy = h['actor_id'];

          if (!legacyId || !reqLegacy || !actorLegacy) {
            await this.quarantineRow(
              qr,
              syncRunId,
              'RequestHistory',
              rowNumber,
              legacyId || null,
              QuarantineReason.COLUMN_SHIFT,
              h,
            );
            quarantinedCount++;
            continue;
          }

          const requestId = requestIdMap.get(reqLegacy);
          const actorId = employeeIdMap.get(actorLegacy);
          if (!requestId || !actorId) {
            await this.quarantineRow(
              qr,
              syncRunId,
              'RequestHistory',
              rowNumber,
              legacyId,
              QuarantineReason.MISSING_FK,
              h,
            );
            quarantinedCount++;
            continue;
          }

          const toStatus = h['to_status']
            ? (String(h['to_status']).toUpperCase().replace(/\s+/g, '_') as ServiceRequestStatus)
            : ServiceRequestStatus.PENDING_APPROVAL;
          const fromStatus = h['from_status']
            ? (String(h['from_status']).toUpperCase().replace(/\s+/g, '_') as ServiceRequestStatus)
            : null;
          const occurredAt = h['occurred_at']
            ? this.sheetSerialToUtcDate(h['occurred_at'])
            : new Date();
          const note = h['note'] || null;

          placeholders.push(
            `($${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++}, $${pIndex++})`,
          );
          values.push(legacyId, requestId, fromStatus, toStatus, actorId, occurredAt, note);
          upsertedCount++;
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

      const totalSourceRows =
        rawRequests.length + rawEquipment.length + rawEmployees.length + rawHistory.length;

      await qr.query(
        `UPDATE legacy_sync.sync_run
         SET status = 'COMPLETED', finished_at = now(), source_rows = $1, upserted = $2, quarantined = $3
         WHERE id = $4`,
        [totalSourceRows, upsertedCount, quarantinedCount, syncRunId],
      );

      await qr.commitTransaction();
      this.logger.log('Google Sheets legacy ingestion completed successfully!');
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error('Failed to ingest from Google Sheets', err);
      throw err;
    } finally {
      await qr.release();
    }
  }
}
