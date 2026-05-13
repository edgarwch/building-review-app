import { FastifyInstance } from 'fastify';
import { submitChecklistSchema, createCommentSchema } from '@app/shared';
import { requireAuth, requireAdmin, type JwtPayload } from '../middleware/auth.js';
import * as submissionService from '../services/submissions.js';
import * as commentService from '../services/comments.js';

export async function submissionRoutes(app: FastifyInstance): Promise<void> {
  // List submissions
  app.get(
    '/api/submissions',
    { preHandler: [requireAuth] },
    async (request) => {
      const query = request.query as { projectId?: string; status?: string };
      const submissions = await submissionService.listSubmissions(query);
      return submissions;
    }
  );

  // Submit a checklist
  app.post(
    '/api/submissions',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { projectId, templateId, templateName, items } = submitChecklistSchema.parse(request.body);
      const user = request.user as JwtPayload;
      const submission = await submissionService.createSubmission({
        projectId,
        templateId,
        templateName,
        items,
        userId: user.sub,
        username: user.username,
      });
      return reply.status(201).send(submission);
    }
  );

  // Get submission detail
  app.get(
    '/api/submissions/:id',
    { preHandler: [requireAuth] },
    async (request) => {
      const { id } = request.params as { id: string };
      const submission = await submissionService.getSubmission(id);
      return submission;
    }
  );

  // Mark as reviewed (admin only)
  app.post(
    '/api/submissions/:id/review',
    { preHandler: [requireAuth, requireAdmin] },
    async (request) => {
      const { id } = request.params as { id: string };
      const user = request.user as JwtPayload;
      await submissionService.reviewSubmission(id, user.sub);
      return { message: 'Submission reviewed' };
    }
  );

  // Reopen (admin only)
  app.delete(
    '/api/submissions/:id/review',
    { preHandler: [requireAuth, requireAdmin] },
    async (request) => {
      const { id } = request.params as { id: string };
      const user = request.user as JwtPayload;
      await submissionService.reopenSubmission(id, user.sub);
      return { message: 'Submission reopened' };
    }
  );

  // Add comment
  app.post(
    '/api/submissions/:id/comments',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { text } = createCommentSchema.parse(request.body);
      const user = request.user as JwtPayload;
      const comment = await commentService.addComment(id, user.sub, user.username, text);
      return reply.status(201).send(comment);
    }
  );

  // List comments
  app.get(
    '/api/submissions/:id/comments',
    { preHandler: [requireAuth] },
    async (request) => {
      const { id } = request.params as { id: string };
      const comments = await commentService.listComments(id);
      return comments;
    }
  );

  // Delete comment (admin only)
  app.delete(
    '/api/submissions/:id/comments/:commentId',
    { preHandler: [requireAuth, requireAdmin] },
    async (request) => {
      const { commentId } = request.params as { commentId: string };
      const user = request.user as JwtPayload;
      await commentService.deleteComment(commentId, user.sub);
      return { message: 'Comment deleted' };
    }
  );
}
