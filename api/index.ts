import type { Request, Response } from 'express';

// Dynamic import of backend app and repository
let cachedApp: any = null;

export default async function handler(req: Request, res: Response) {
  if (!cachedApp) {
    // In Vercel serverless, set VERCEL environment flag
    process.env.VERCEL = '1';
    
    // Dynamic import to support ES modules in serverless
    const { initializeDatabase } = await import('../server/src/db/repository.js');
    const { createApp } = await import('../server/src/app.js');

    await initializeDatabase();
    cachedApp = createApp();
  }

  return cachedApp(req, res);
}
