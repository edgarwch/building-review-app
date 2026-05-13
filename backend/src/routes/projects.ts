import { FastifyInstance } from 'fastify';
import { createProjectSchema, updateProjectSchema } from '@app/shared';
import { requireAuth, requireAdmin, type JwtPayload } from '../middleware/auth.js';
import * as projectService from '../services/projects.js';

export async function projectRoutes(app: FastifyInstance): Promise<void> {
  // List all projects
  app.get(
    '/api/projects',
    { preHandler: [requireAuth] },
    async () => {
      const projects = await projectService.listProjects();
      return projects;
    }
  );

  // Create a project
  app.post(
    '/api/projects',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { name, address } = createProjectSchema.parse(request.body);
      const user = request.user as JwtPayload;
      const project = await projectService.createProject(name, address, user.sub);
      return reply.status(201).send(project);
    }
  );

  // Get a single project
  app.get(
    '/api/projects/:id',
    { preHandler: [requireAuth] },
    async (request) => {
      const { id } = request.params as { id: string };
      const project = await projectService.getProject(id);
      return project;
    }
  );

  // Update a project (admin only)
  app.put(
    '/api/projects/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request) => {
      const { id } = request.params as { id: string };
      const { name, address } = updateProjectSchema.parse(request.body);
      await projectService.updateProject(id, name, address);
      return { message: 'Project updated' };
    }
  );

  // Delete a project (admin only)
  app.delete(
    '/api/projects/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request) => {
      const { id } = request.params as { id: string };
      await projectService.deleteProject(id);
      return { message: 'Project deleted' };
    }
  );
}
