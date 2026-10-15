import { AppDataSource } from '../data-source';
import { execSync } from 'child_process';

interface ColumnDiff {
  table: string;
  column: string;
  type: 'MISSING_IN_DB' | 'MISSING_IN_ENTITY' | 'TYPE_MISMATCH';
  details: string;
}

/**
 * Checks if the current commit or environment specifies to skip the schema drift check.
 */
function isSkipDriftRequested(): boolean {
  if (process.env.SKIP_DRIFT === 'true' || process.env.SKIP_DRIFT === '1') {
    return true;
  }

  try {
    const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' });
    if (/\[skip-drift\]/i.test(commitMsg)) {
      return true;
    }
  } catch {
    // Ignore git error
  }

  return false;
}

async function run() {
  console.log('🔍 Checking Schema Drift (Columns & Tables: TypeORM Entities vs PostgreSQL)...');

  if (isSkipDriftRequested()) {
    console.log('⏩ [skip-drift] flag detected! Skipping schema drift check.');
    process.exit(0);
  }

  try {
    await AppDataSource.initialize();

    const diffs: ColumnDiff[] = [];
    const entityMetadatas = AppDataSource.entityMetadatas;

    for (const metadata of entityMetadatas) {
      const tableName = metadata.tableName;
      const schema = metadata.schema || 'public';

      // 1. Check if table exists in PostgreSQL
      const tableCheck = await AppDataSource.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
        [schema, tableName],
      );

      if (tableCheck.length === 0) {
        diffs.push({
          table: tableName,
          column: '*',
          type: 'MISSING_IN_DB',
          details: `Table "${schema}.${tableName}" exists in TypeORM Entity (${metadata.targetName}) but is missing in PostgreSQL database.`,
        });
        continue;
      }

      // 2. Fetch database columns for this table
      const dbColumns: Array<{
        column_name: string;
        data_type: string;
        udt_name: string;
        is_nullable: string;
      }> = await AppDataSource.query(
        `SELECT column_name, data_type, udt_name, is_nullable
           FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = $2`,
        [schema, tableName],
      );

      const dbColMap = new Map(dbColumns.map((c) => [c.column_name.toLowerCase(), c]));

      // 3. Verify each entity column exists in DB
      for (const col of metadata.columns) {
        const colName = col.databaseName.toLowerCase();
        const dbCol = dbColMap.get(colName);

        if (!dbCol) {
          diffs.push({
            table: tableName,
            column: col.databaseName,
            type: 'MISSING_IN_DB',
            details: `Column "${col.databaseName}" defined in Entity (${metadata.targetName}) does not exist in PostgreSQL table "${tableName}".`,
          });
        }
      }

      // 4. (Optional info) Check if DB has columns that Entity doesn't map
      const entityColNames = new Set(metadata.columns.map((c) => c.databaseName.toLowerCase()));
      for (const dbCol of dbColumns) {
        if (!entityColNames.has(dbCol.column_name.toLowerCase())) {
          // Warning only or diff
          console.warn(
            `  ⚠️ [Note] DB table "${tableName}" has column "${dbCol.column_name}" not mapped in Entity "${metadata.targetName}".`,
          );
        }
      }
    }

    if (diffs.length > 0) {
      console.error('\n❌ CRITICAL SCHEMA DRIFT DETECTED!');
      console.error('The following columns/tables are missing in the Database:\n');
      diffs.forEach((d, idx) => {
        console.error(`  ${idx + 1}. [${d.type}] Table: ${d.table} -> ${d.details}`);
      });
      console.error('\n💡 Action Required:');
      console.error('  - Create a migration to add the missing table/columns.');
      console.error(
        '  - If this is an emergency hotfix and cannot wait, use "[skip-drift]" in your commit message or set SKIP_DRIFT=true.\n',
      );

      await AppDataSource.destroy();
      process.exit(1);
    }

    console.log(
      '✅ PASS: All TypeORM Entities match PostgreSQL core tables and columns perfectly!',
    );
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('⚠️ Failed to connect to database or check drift:', error);
    await AppDataSource.destroy().catch(() => {});
    process.exit(1);
  }
}

run();
