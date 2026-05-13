import { FastifyInstance } from 'fastify';
import { createTemplateSchema, updateTemplateSchema } from '@app/shared';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as templateService from '../services/templates.js';

export async function templateRoutes(app: FastifyInstance): Promise<void> {
  // List templates for a project
  app.get(
    '/api/projects/:projectId/templates',
    { preHandler: [requireAuth] },
    async (request) => {
      const { projectId } = request.params as { projectId: string };
      const templates = await templateService.listByProject(projectId);
      return templates;
    }
  );

  // Create a template (admin only)
  app.post(
    '/api/projects/:projectId/templates',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };
      const { category, name, items } = createTemplateSchema.parse({
        ...(request.body as Record<string, unknown>),
        projectId,
      });
      const template = await templateService.createTemplate(projectId, category, name, items);
      return reply.status(201).send(template);
    }
  );

  // Get a single template
  app.get(
    '/api/templates/:id',
    { preHandler: [requireAuth] },
    async (request) => {
      const { id } = request.params as { id: string };
      const template = await templateService.getTemplate(id);
      return template;
    }
  );

  // Update a template (admin only)
  app.put(
    '/api/templates/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;
      const { category, name, items } = updateTemplateSchema.parse({
        projectId: body.projectId || '',
        category: body.category,
        name: body.name,
        items: body.items,
      });
      await templateService.updateTemplate(id, category, name, items);
      return { message: 'Template updated' };
    }
  );

  // Delete a template (admin only)
  app.delete(
    '/api/templates/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request) => {
      const { id } = request.params as { id: string };
      await templateService.deleteTemplate(id);
      return { message: 'Template deleted' };
    }
  );
}
