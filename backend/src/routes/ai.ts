import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import * as aiService from '../services/ai.js';

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/api/ai/summarize/:submissionId',
    { preHandler: [requireAuth] },
    async (request) => {
      const { submissionId } = request.params as { submissionId: string };
      const result = await aiService.getSummary(submissionId);
      return result;
    }
  );
}
