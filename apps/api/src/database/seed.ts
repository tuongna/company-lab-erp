import { runSync } from './sync';
runSync(process.argv.includes('--excel') ? 'xlsx' : 'sheets', true).catch(() => {
  console.error('Seed failed. Inspect legacy_sync.sync_run and configuration.');
  process.exitCode = 1;
});
