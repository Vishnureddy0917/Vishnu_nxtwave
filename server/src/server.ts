import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { initializeDatabase } from './db/repository.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  try {
    console.log('[LaunchLoop AI] Initializing persistent local NoSQL Document Store...');
    await initializeDatabase();
    console.log('[LaunchLoop AI] Local collections verified and loaded.');

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 LaunchLoop AI Server running on http://localhost:${PORT}`);
      console.log(`📊 Local NoSQL Database Directory: ../data/`);
      console.log(`🛡️  Admin Account: admin@launchloop.ai / Admin@LaunchLoop2026!`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (err) {
    console.error('[LaunchLoop Server Fatal Startup Error]:', err);
    process.exit(1);
  }
}

startServer();
