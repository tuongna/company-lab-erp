import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestService } from '../application/service-request.service';
import { TransitionService } from '../application/transition.service';

describe('Shadow write protection', () => {
  let app: INestApplication;
  const transition = jest.fn().mockResolvedValue({});
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ServiceRequestController],
      providers: [
        { provide: ServiceRequestService, useValue: {} },
        { provide: TransitionService, useValue: { transition } },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  it.each([{}, { 'x-actor-role': 'ADMIN', 'x-actor-id': 'forged' }])(
    'blocks unauthenticated and forged actor headers',
    async (headers) => {
      await request(app.getHttpServer())
        .post('/api/requests/REQ-1/transition')
        .set(headers)
        .send({ version: 1, targetStatus: 'COMPLETED' })
        .expect(403);
      expect(transition).not.toHaveBeenCalled();
    },
  );
});
