import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from '../application/employee.service';

describe('EmployeeController', () => {
  let app: INestApplication;
  const mockEmployeeService = {
    findAll: jest.fn().mockResolvedValue({
      items: [{ id: 'emp-1', name: 'Alice', department: 'HR' }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [{ provide: EmployeeService, useValue: mockEmployeeService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/employees returns paginated employees', async () => {
    const res = await request(app.getHttpServer()).get('/api/employees').expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('Alice');
  });

  it('GET /api/employees/:idOrLegacyId returns single employee', async () => {
    mockEmployeeService.findOne.mockResolvedValueOnce({
      id: 'emp-1',
      name: 'Alice',
    });

    const res = await request(app.getHttpServer()).get('/api/employees/EMP-01').expect(200);

    expect(res.body.name).toBe('Alice');
  });

  it('GET /api/employees/:idOrLegacyId returns 404 when not found', async () => {
    mockEmployeeService.findOne.mockResolvedValueOnce(null);

    await request(app.getHttpServer()).get('/api/employees/NON-EXISTENT').expect(404);
  });
});
