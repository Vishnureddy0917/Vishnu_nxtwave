import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const dataDir = path.resolve(process.cwd(), '../data');
    const backupBaseDir = path.resolve(process.cwd(), '../backups');

    if (!fs.existsSync(dataDir)) {
      console.error('[DB Backup Error] Data directory does not exist at:', dataDir);
      process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const targetBackupDir = path.join(backupBaseDir, `backup_${timestamp}`);

    await fs.promises.mkdir(targetBackupDir, { recursive: true });

    const files = await fs.promises.readdir(dataDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    for (const file of jsonFiles) {
      const src = path.join(dataDir, file);
      const dest = path.join(targetBackupDir, file);
      await fs.promises.copyFile(src, dest);
    }

    console.log(`[DB Backup] Successfully backed up ${jsonFiles.length} collections to:`);
    console.log(`-> ${targetBackupDir}`);
    process.exit(0);
  } catch (err) {
    console.error('[DB Backup Error]:', err);
    process.exit(1);
  }
}

main();
