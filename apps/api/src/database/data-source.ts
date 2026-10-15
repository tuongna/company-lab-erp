import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        migrationsRun: false,
        entities: [path.resolve(__dirname, '../modules/**/*.entity{.ts,.js}')],
        migrations: [path.resolve(__dirname, './migrations/*{.ts,.js}')],
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'clt_admin',
        password: process.env.DATABASE_PASSWORD || 'clt_password_local',
        database: process.env.DATABASE_NAME || 'clt_erp_dev',
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        migrationsRun: false,
        entities: [path.resolve(__dirname, '../modules/**/*.entity{.ts,.js}')],
        migrations: [path.resolve(__dirname, './migrations/*{.ts,.js}')],
      },
);
