import { FastifyRequest, FastifyReply } from 'fastify';

export interface JwtPayload {
  sub: string;
  username: string;
  role: 'admin' | 'inspector';
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ error: 'unauthorized', message: 'Invalid or missing token' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = request.user as JwtPayload;
  if (!user || user.role !== 'admin') {
    return reply.status(403).send({ error: 'forbidden', message: 'Admin access required' });
  }
}
