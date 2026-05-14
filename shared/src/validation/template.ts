import { z } from 'zod';

const templateItemSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(200),
  type: z.enum(['boolean', 'text', 'number']),
});

export const createTemplateSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  items: z.array(templateItemSchema).min(1),
});

export const updateTemplateSchema = createTemplateSchema;

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
