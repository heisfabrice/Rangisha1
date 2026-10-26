import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/api';
import { healthHandler } from './server/app';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Health check endpoint
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount main API router under /api
app.use('/api', apiRouter);

// Unknown API routes handler: any /api/* request not matched returns JSON 404, never HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  if (!isProduction) {
    // Development mode: dynamically import Vite and use its middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static files from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rangisha.com] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Rangisha.com server:', err);
  process.exit(1);
});
