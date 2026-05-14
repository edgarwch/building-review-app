import { z } from 'zod';

export const submitChecklistSchema = z.object({
  projectId: z.string().min(1),
  templateId: z.string().min(1),
  templateName: z.string().min(1),
  items: z.array(z.object({
    tool: z.string().min(1),
    details: z.string(),
  })),
});

export type SubmitChecklistInput = z.infer<typeof submitChecklistSchema>;
