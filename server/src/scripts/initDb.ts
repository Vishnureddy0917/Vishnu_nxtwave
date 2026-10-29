import { initializeDatabase } from '../db/repository.js';

async function main() {
  try {
    console.log('[DB Init] Initializing local NoSQL collections in data/ ...');
    await initializeDatabase();
    console.log('[DB Init] Successfully initialized all collections with safe empty state and defaults.');
    process.exit(0);
  } catch (err) {
    console.error('[DB Init Error]:', err);
    process.exit(1);
  }
}

main();
