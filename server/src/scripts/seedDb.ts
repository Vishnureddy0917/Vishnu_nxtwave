import { seedDemoData } from '../db/seed.js';

async function main() {
  const isReset = process.argv.includes('--reset');
  try {
    if (isReset) {
      console.log('[DB Reset] Removing demo data while preserving real registrations...');
      await seedDemoData(true);
      console.log('[DB Reset] Done.');
    } else {
      console.log('[DB Seed] Seeding deterministic demo data...');
      const result = await seedDemoData(false);
      console.log('[DB Seed] Seeding completed successfully:', result);
    }
    process.exit(0);
  } catch (err) {
    console.error('[DB Seed Error]:', err);
    process.exit(1);
  }
}

main();
