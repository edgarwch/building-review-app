import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(200),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(200),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
