import { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from '@app/shared';
import { registerUser, loginUser, generateTokens, refreshAccessToken } from '../services/auth.js';
import { requireAuth, JwtPayload } from '../middleware/auth.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/auth/register', async (request, reply) => {
    const { username, password } = registerSchema.parse(request.body);
    const role = (request.body as any).role === 'admin' ? 'admin' : 'inspector';
    await registerUser(username, password, role);
    return reply.status(201).send({ message: 'User registered' });
  });

  app.post('/api/auth/login', async (request, reply) => {
    const { username, password } = loginSchema.parse(request.body);
    const user = await loginUser(username, password);
    const tokens = generateTokens(app, user);
    return { user: { id: user._id, username: user.username, role: user.role }, ...tokens };
  });

  app.post('/api/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    if (!refreshToken) {
      return reply.status(400).send({ error: 'bad_request', message: 'Missing refreshToken' });
    }
    const tokens = await refreshAccessToken(app, refreshToken);
    return tokens;
  });

  app.get('/api/auth/me', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user as JwtPayload;
    return { id: user.sub, username: user.username, role: user.role };
  });
}
