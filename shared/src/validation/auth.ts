import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
