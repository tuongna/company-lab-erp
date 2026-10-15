import { AppDataSource } from '../data-source';
import * as fs from 'fs';
import * as path from 'path';

const formatMermaidTableName = (schema: string, table: string) =>
  schema === 'public' ? table : `${schema}_${table}`;

async function run() {
  console.log('📊 Generating Database ERD from PostgreSQL Schema...');

  try {
    await AppDataSource.initialize();

    // 1. Fetch tables
    const tables: Array<{ table_schema: string; table_name: string }> = await AppDataSource.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema IN ('public', 'legacy_sync')
        AND table_name NOT IN ('migrations')
      ORDER BY table_schema, table_name;
    `);

    // 2. Fetch columns
    const columns: Array<{
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      udt_name: string;
      is_nullable: string;
    }> = await AppDataSource.query(`
      SELECT table_schema, table_name, column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema IN ('public', 'legacy_sync')
        AND table_name NOT IN ('migrations')
      ORDER BY table_schema, table_name, ordinal_position;
    `);

    // 3. Fetch PKs
    const pks: Array<{ table_schema: string; table_name: string; column_name: string }> =
      await AppDataSource.query(`
      SELECT tc.table_schema, tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema IN ('public', 'legacy_sync');
    `);
    const pkSet = new Set(pks.map((p) => `${p.table_schema}.${p.table_name}.${p.column_name}`));

    // 4. Fetch FKs
    const fks: Array<{
      table_schema: string;
      table_name: string;
      column_name: string;
      foreign_table_schema: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }> = await AppDataSource.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema IN ('public', 'legacy_sync');
    `);
    const fkSet = new Set(fks.map((f) => `${f.table_schema}.${f.table_name}.${f.column_name}`));

    // Group columns by table
    const tableColumns = new Map<string, typeof columns>();
    for (const col of columns) {
      const key = `${col.table_schema}.${col.table_name}`;
      if (!tableColumns.has(key)) tableColumns.set(key, []);
      tableColumns.get(key)!.push(col);
    }

    // Build Mermaid Diagram String
    const mermaidLines: string[] = ['erDiagram'];

    // Add Relationships with consistent table names
    for (const fk of fks) {
      const fromTable = formatMermaidTableName(fk.table_schema, fk.table_name);
      const toTable = formatMermaidTableName(fk.foreign_table_schema, fk.foreign_table_name);
      mermaidLines.push(`    ${toTable} ||--o{ ${fromTable} : "${fk.column_name}"`);
    }
    mermaidLines.push('');

    // Add Tables & Columns
    for (const t of tables) {
      const fullKey = `${t.table_schema}.${t.table_name}`;
      const cols = tableColumns.get(fullKey) || [];
      const tableName = formatMermaidTableName(t.table_schema, t.table_name);

      mermaidLines.push(`    ${tableName} {`);
      for (const c of cols) {
        const isPk = pkSet.has(`${t.table_schema}.${t.table_name}.${c.column_name}`);
        const isFk = fkSet.has(`${t.table_schema}.${t.table_name}.${c.column_name}`);
        let keyFlag = '';
        if (isPk) keyFlag = 'PK';
        else if (isFk) keyFlag = 'FK';

        const cleanType = c.udt_name.replace(/[^a-zA-Z0-9_]/g, '');
        mermaidLines.push(`        ${cleanType} ${c.column_name} ${keyFlag}`);
      }
      mermaidLines.push('    }');
    }

    const mermaidCode = mermaidLines.join('\n');

    // 1. Output Markdown File
    const mdLines: string[] = [];
    mdLines.push('# Database Entity-Relationship Diagram (ERD)');
    mdLines.push('');
    mdLines.push('> ⚠️ **Auto-generated file** directly from PostgreSQL ground-truth catalog.');
    mdLines.push('> Run `pnpm db:diagram` to regenerate after migrations.');
    mdLines.push('> Or view directly in browser via: `open docs/architecture/database-erd.html`');
    mdLines.push('');
    mdLines.push('```mermaid');
    mdLines.push(mermaidCode);
    mdLines.push('```');
    mdLines.push('');
    mdLines.push('## Summary of Tables');
    mdLines.push('');
    mdLines.push('| Schema | Table Name | Columns | Foreign Keys |');
    mdLines.push('| :--- | :--- | :--- | :--- |');

    for (const t of tables) {
      const fullKey = `${t.table_schema}.${t.table_name}`;
      const colCount = (tableColumns.get(fullKey) || []).length;
      const fkCount = fks.filter(
        (f) => f.table_schema === t.table_schema && f.table_name === t.table_name,
      ).length;
      mdLines.push(`| \`${t.table_schema}\` | \`${t.table_name}\` | ${colCount} | ${fkCount} |`);
    }

    const outputMdPath = path.resolve(
      __dirname,
      '../../../../../docs/architecture/database-erd.md',
    );
    fs.writeFileSync(outputMdPath, mdLines.join('\n'), 'utf-8');

    // 2. Output Standalone HTML File (Zero configuration required to view!)
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CompanyLab ERP — Database ERD</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f8fafc;
      color: #0f172a;
    }
    .header {
      max-width: 1400px;
      margin: 0 auto 20px auto;
      padding: 16px 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: #e0f2fe;
      color: #0369a1;
    }
    .diagram-container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CompanyLab ERP — Database ERD</h1>
      <small style="color: #64748b;">Live schema from PostgreSQL (Ground Truth). Auto-updated by <code>pnpm db:diagram</code>.</small>
    </div>
    <span class="badge">PostgreSQL 16</span>
  </div>
  <div class="diagram-container">
    <div class="mermaid">
${mermaidCode}
    </div>
  </div>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      er: {
        useMaxWidth: false
      }
    });
  </script>
</body>
</html>`;

    const outputHtmlPath = path.resolve(
      __dirname,
      '../../../../../docs/architecture/database-erd.html',
    );
    fs.writeFileSync(outputHtmlPath, htmlContent, 'utf-8');

    console.log(`✅ Markdown ERD generated at: ${outputMdPath}`);
    console.log(`✅ Interactive HTML ERD generated at: ${outputHtmlPath}`);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('⚠️ Failed to generate ERD:', error);
    await AppDataSource.destroy().catch(() => {});
    process.exit(1);
  }
}

run();
