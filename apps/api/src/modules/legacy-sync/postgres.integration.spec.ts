import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { InitialSchema1760410000000 } from '../../database/migrations/1760410000000-InitialSchema';
import { LegacyStaging1791970000000 } from '../../database/migrations/1791970000000-LegacyStaging';
import { IngestionService } from './ingestion.service';
import { fixture } from './fixtures';
import { EmployeeEntity } from '../organization/domain/employee.entity';
import { AssetEntity } from '../asset/domain/asset.entity';
import { ServiceRequestEntity } from '../service-request/domain/service-request.entity';
import { RequestHistoryEntity } from '../service-request/domain/request-history.entity';
import { AttachmentEntity } from '../service-request/domain/attachment.entity';
import { TransitionService } from '../service-request/application/transition.service';
import { AssetService } from '../asset/application/asset.service';
import { ServiceRequestStatus, UserRole } from '@companylab/contracts';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;
integration('PostgreSQL 16 concurrency (isolated CI database)', () => {
  let db: DataSource;
  beforeAll(async () => {
    const parsed = new URL(url!);
    if (
      !['localhost', '127.0.0.1'].includes(parsed.hostname) ||
      parsed.pathname !== '/companylab_ci'
    )
      throw new Error('Tests require a fresh local companylab_ci database');
    db = new DataSource({
      type: 'postgres',
      url,
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
      entities: [
        EmployeeEntity,
        AssetEntity,
        ServiceRequestEntity,
        RequestHistoryEntity,
        AttachmentEntity,
      ],
    });
    await db.initialize();
    const q = db.createQueryRunner();
    await q.connect();
    try {
      await new InitialSchema1760410000000().up(q);
      await new LegacyStaging1791970000000().up(q);
    } finally {
      await q.release();
    }
  });
  afterAll(async () => {
    if (db?.isInitialized) await db.destroy();
  });
  it('serializes concurrent sync jobs before either extracts the second snapshot', async () => {
    let enter!: () => void;
    let unblock!: () => void;
    const entered = new Promise<void>((resolve) => {
      enter = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      unblock = resolve;
    });
    const first = new IngestionService(db).run({
      read: async () => {
        enter();
        await gate;
        return fixture();
      },
    });
    await entered;
    const secondRead = jest.fn(async () => fixture());
    try {
      await expect(new IngestionService(db).run({ read: secondRead })).rejects.toThrow(
        'Another legacy sync',
      );
      expect(secondRead).not.toHaveBeenCalled();
    } finally {
      unblock();
    }
    expect((await first).status).toBe('COMPLETED');
    expect((await new IngestionService(db).run({ read: async () => fixture() })).upserted).toBe(0);
  });
  it('allows exactly one concurrent completion on the same asset', async () => {
    await db.query("UPDATE service_request SET status='IN_PROGRESS'");
    await db.query(
      "INSERT INTO service_request(legacy_id,employee_id,request_type,status) SELECT 'REQ-2',id,'ALLOCATION','IN_PROGRESS' FROM employee WHERE legacy_id='OP-1'",
    );
    const assets = (await db.query('SELECT id FROM asset')) as { id: string }[];
    const actors = (await db.query("SELECT id FROM employee WHERE legacy_id='OP-1'")) as {
      id: string;
    }[];
    const service = new TransitionService(db, new AssetService(db));
    const results = await Promise.allSettled(
      ['REQ-1', 'REQ-2'].map((id) =>
        service.transition(
          id,
          {
            targetStatus: ServiceRequestStatus.COMPLETED,
            version: 1,
            assignedAssetId: assets[0]!.id,
          },
          actors[0]!.id,
          UserRole.OPERATOR,
        ),
      ),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect(
      await db.query("SELECT count(*)::int AS n FROM service_request WHERE status='COMPLETED'"),
    ).toEqual([{ n: 1 }]);
    expect(
      await db.query("SELECT count(*)::int AS n FROM request_history WHERE to_status='COMPLETED'"),
    ).toEqual([{ n: 1 }]);
  });
});
