import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required').default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER is required').default('clt_admin'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required').default('clt_erp_dev'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  TZ: z.string().default('Asia/Ho_Chi_Minh'),
  LEGACY_PHASE: z.string().optional(),
  LEGACY_SPREADSHEET_ID: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  AUTH_DEV_MODE: z
    .string()
    .transform((v) => v === 'true' || v === '1')
    .optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const errorMessages = result.error.errors
      .map((issue) => `[${issue.path.join('.')}]: ${issue.message}`)
      .join(', ');
    throw new Error(`Environment validation error: ${errorMessages}`);
  }
  return result.data;
}
