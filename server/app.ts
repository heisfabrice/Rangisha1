import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './api';
import { testMongoConnection } from './mongodb';

dotenv.config();

// Health check handler
export const healthHandler = async (_req: Request, res: Response) => {
  const mongoStatus = await testMongoConnection().catch(() => ({
    connected: false,
    message: 'Unable to reach database'
  }));

  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: 'ok',
    service: 'Rangisha.com Lost & Found Platform',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'MongoDB Atlas',
      connected: mongoStatus.connected,
      message: mongoStatus.message
    }
  });
};

/**
 * Creates the Express application configured specifically for Vercel Serverless Function (/api/index.ts).
 * In Vercel, every request routed to this handler is an /api request.
 */
export function createServerlessApiApp() {
  const serverlessApp = express();
  serverlessApp.use(express.json({ limit: '10mb' }));
  serverlessApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

  serverlessApp.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  serverlessApp.get('/api/health', healthHandler);
  serverlessApp.get('/health', healthHandler);

  serverlessApp.use('/api', apiRouter);
  serverlessApp.use('/', apiRouter);

  // Any unmatched route inside the serverless API function returns JSON 404
  serverlessApp.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString()
    });
  });

  serverlessApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Rangisha API Serverless Error]:', err?.message || err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    res.status(status).json({
      error: err?.message || 'An unexpected server error occurred',
      timestamp: new Date().toISOString()
    });
  });

  return serverlessApp;
}

export const app = createServerlessApiApp();
