import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';

describe('TypeOrmExceptionFilter', () => {
  let filter: TypeOrmExceptionFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new TypeOrmExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => ({ url: '/test' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should map 23505 (unique_violation) to 409 Conflict', () => {
    const error = new QueryFailedError(
      'INSERT INTO assets ...',
      [],
      Object.assign(new Error('duplicate key value'), {
        code: '23505',
        detail: 'Key (holder_employee_id)=(EMP-1) already exists in uq_asset_one_laptop_per_holder',
        constraint: 'uq_asset_one_laptop_per_holder',
      }),
    );

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: 'Conflict',
        message: expect.stringContaining('Key (holder_employee_id)'),
      }),
    );
  });

  it('should map 23503 (foreign_key_violation) to 409 Conflict', () => {
    const error = new QueryFailedError(
      'INSERT INTO service_request ...',
      [],
      Object.assign(new Error('foreign key violation'), {
        code: '23503',
        detail: 'Key (employee_id)=(EMP-999) is not present in table "employee"',
      }),
    );

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: 'Conflict',
        message: expect.stringContaining('Key (employee_id)'),
      }),
    );
  });

  it('should map 23514 (check_violation) to 409 Conflict', () => {
    const error = new QueryFailedError(
      'UPDATE assets ...',
      [],
      Object.assign(new Error('check constraint violation'), {
        code: '23514',
        constraint: 'chk_asset_status_holder_consistency',
      }),
    );

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: 'Conflict',
        message: expect.stringContaining('chk_asset_status_holder_consistency'),
      }),
    );
  });

  it('should map unknown database error to 500 without leaking raw query', () => {
    const error = new QueryFailedError(
      'SELECT secret_column FROM sensitive_table',
      [],
      Object.assign(new Error('relation "sensitive_table" does not exist'), {
        code: '42P01',
      }),
    );

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'InternalServerError',
        message: 'An unexpected database error occurred',
      }),
    );
  });
});
