import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { CONFIG } from './config.js';
import { apiRouter } from './routes/api.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route('/api', apiRouter);

app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

const port = CONFIG.port;
console.log(`?? StoryCraft Monorepo Hono Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port
});
