import { runSync } from './sync';
runSync().catch(() => {
  console.error('Seed failed. Inspect legacy_sync.sync_run and configuration.');
  process.exitCode = 1;
});
