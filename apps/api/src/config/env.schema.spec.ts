import { validateEnv } from './env.schema';

describe('validateEnv', () => {
  it('should successfully validate valid config and apply defaults', () => {
    const raw = {
      DATABASE_PASSWORD: 'secretpassword',
    };
    const validated = validateEnv(raw);
    expect(validated.DATABASE_PASSWORD).toBe('secretpassword');
    expect(validated.PORT).toBe(3001);
    expect(validated.DATABASE_HOST).toBe('localhost');
    expect(validated.DATABASE_PORT).toBe(5432);
    expect(validated.NODE_ENV).toBe('development');
    expect(validated.CORS_ORIGIN).toBe('http://localhost:3000');
  });

  it('should throw an error when DATABASE_PASSWORD is missing', () => {
    const raw = {
      DATABASE_HOST: 'localhost',
    };
    expect(() => validateEnv(raw)).toThrow('Environment validation error: [DATABASE_PASSWORD]');
  });

  it('should throw an error when NODE_ENV is invalid', () => {
    const raw = {
      DATABASE_PASSWORD: 'secretpassword',
      NODE_ENV: 'invalid_env',
    };
    expect(() => validateEnv(raw)).toThrow('Environment validation error: [NODE_ENV]');
  });
});
