import * as path from 'path';
import * as fs from 'fs';
import { google } from 'googleapis';

const SPREADSHEET_ID =
  process.env.LEGACY_SPREADSHEET_ID || '1-ADW3SxNi_ailWvrOUMso8wg8Gga4hVIqvNdq6bws1I';

// Search credentials file
const possibleKeyPaths = [
  path.resolve(process.cwd(), 'credentials/google-service-account.json'),
  path.resolve(process.cwd(), '../../credentials/google-service-account.json'),
  path.resolve(__dirname, '../../../../credentials/google-service-account.json'),
];

const keyFile = possibleKeyPaths.find((p) => fs.existsSync(p));

async function main() {
  console.log('--- Google Sheets Connection Test ---');

  if (!keyFile) {
    console.error('❌ Service Account key not found in:');
    possibleKeyPaths.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }

  console.log(`🔑 Using Key File: ${keyFile}`);
  console.log(`📄 Spreadsheet ID: ${SPREADSHEET_ID}`);

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('\n⏳ Fetching spreadsheet metadata...');
    const metaResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const spreadsheetTitle = metaResponse.data.properties?.title;
    console.log(`✅ Connected successfully!`);
    console.log(`📋 Title: "${spreadsheetTitle}"`);

    const sheetList = metaResponse.data.sheets || [];
    console.log(`📑 Found ${sheetList.length} sheets:`);
    sheetList.forEach((s) => {
      const name = s.properties?.title;
      const rowCount = s.properties?.gridProperties?.rowCount;
      const colCount = s.properties?.gridProperties?.columnCount;
      console.log(`   - ${name} (grid size: ${rowCount} rows x ${colCount} cols)`);
    });

    // Check sample ranges according to legacy integration rules
    console.log('\n⏳ Fetching sample rows with spreadsheets.values.batchGet...');
    const ranges = ['Employees!A1:E3', 'Equipment!A1:E3', 'Requests!A1:F3'];

    const dataResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'SERIAL_NUMBER',
    });

    const valueRanges = dataResponse.data.valueRanges || [];
    for (const vr of valueRanges) {
      console.log(`\n📌 Range: ${vr.range}`);
      const rows = vr.values || [];
      if (rows.length === 0) {
        console.log('   (Empty range)');
      } else {
        rows.forEach((row, idx) => {
          console.log(`   Row ${idx + 1}: ${JSON.stringify(row)}`);
        });
      }
    }

    console.log(
      '\n🎉 ALL CHECKS PASSED: Service Account has read access and Google Sheets API is working properly!',
    );
  } catch (err: any) {
    console.error('\n❌ Connection failed:');
    if (err.response?.data?.error) {
      console.error('Google API Error:', JSON.stringify(err.response.data.error, null, 2));
    } else {
      console.error(err.message || err);
    }
    process.exit(1);
  }
}

main();
