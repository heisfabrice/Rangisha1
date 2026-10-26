import { app } from '../server/app';

/**
 * Vercel Serverless Function entry point.
 * Dispatches incoming /api/* requests to the Express application.
 */
export default function handler(req: any, res: any) {
  return app(req, res);
}
