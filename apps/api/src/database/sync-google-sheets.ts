import { runSync } from './sync';
runSync().catch(() => {
  console.error('Google Sheets sync failed. Inspect configuration and legacy_sync.sync_run.');
  process.exitCode = 1;
});
