import Fastify from 'fastify';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import { config } from './config.js';
import { connectDb } from './db.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { templateRoutes } from './routes/templates.js';
import { submissionRoutes } from './routes/submissions.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { mediaRoutes } from './routes/media.js';
import { aiRoutes } from './routes/ai.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
await app.register(fjwt, { secret: config.jwtSecret });
registerErrorHandler(app);

let dbConnected = false;

try {
  await connectDb();
  dbConnected = true;
} catch (err) {
  console.warn('MongoDB not available — running without database');
}

await app.register(authRoutes);
await app.register(projectRoutes);
await app.register(templateRoutes);
await app.register(submissionRoutes);
await app.register(dashboardRoutes);
await app.register(mediaRoutes);
await app.register(aiRoutes);

app.get('/api/health', async () => ({
  status: 'ok',
  time: new Date().toISOString(),
  db: dbConnected ? 'connected' : 'disconnected',
}));

await app.listen({ port: config.port, host: '0.0.0.0' });
console.log(`Backend running on http://localhost:${config.port}`);

export default app;
