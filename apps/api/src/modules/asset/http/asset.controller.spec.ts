import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from '../application/asset.service';

describe('AssetController', () => {
  let app: INestApplication;
  const mockAssetService = {
    findAll: jest.fn().mockResolvedValue({
      items: [{ id: 'asset-1', model: 'ThinkPad' }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [{ provide: AssetService, useValue: mockAssetService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/assets returns paginated asset list', async () => {
    const res = await request(app.getHttpServer()).get('/api/assets').expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].model).toBe('ThinkPad');
  });

  it('GET /api/assets/:idOrLegacyId returns single asset', async () => {
    mockAssetService.findOne.mockResolvedValueOnce({
      id: 'asset-1',
      model: 'ThinkPad',
    });

    const res = await request(app.getHttpServer()).get('/api/assets/AST-001').expect(200);

    expect(res.body.model).toBe('ThinkPad');
  });

  it('GET /api/assets/:idOrLegacyId returns 404 when not found', async () => {
    mockAssetService.findOne.mockResolvedValueOnce(null);

    await request(app.getHttpServer()).get('/api/assets/NON-EXISTENT').expect(404);
  });
});
