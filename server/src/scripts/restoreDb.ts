import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const dataDir = path.resolve(process.cwd(), '../data');
    const backupBaseDir = path.resolve(process.cwd(), '../backups');

    if (!fs.existsSync(backupBaseDir)) {
      console.error('[DB Restore Error] No backups found. Directory does not exist:', backupBaseDir);
      process.exit(1);
    }

    const backups = await fs.promises.readdir(backupBaseDir);
    const sortedBackups = backups.filter((b) => b.startsWith('backup_')).sort().reverse();

    if (sortedBackups.length === 0) {
      console.error('[DB Restore Error] No valid backup snapshots available.');
      process.exit(1);
    }

    // Default to the latest backup unless specified as argument
    const targetBackup = process.argv[2] || sortedBackups[0];
    const sourceDir = path.join(backupBaseDir, targetBackup);

    if (!fs.existsSync(sourceDir)) {
      console.error(`[DB Restore Error] Target backup does not exist: ${sourceDir}`);
      process.exit(1);
    }

    console.log(`[DB Restore] Restoring database collections from snapshot: ${targetBackup} ...`);

    if (!fs.existsSync(dataDir)) {
      await fs.promises.mkdir(dataDir, { recursive: true });
    }

    const files = await fs.promises.readdir(sourceDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const src = path.join(sourceDir, file);
        const dest = path.join(dataDir, file);
        await fs.promises.copyFile(src, dest);
      }
    }

    console.log(`[DB Restore Success] Restored ${files.length} collections into ${dataDir}.`);
    process.exit(0);
  } catch (err) {
    console.error('[DB Restore Error]:', err);
    process.exit(1);
  }
}

main();
