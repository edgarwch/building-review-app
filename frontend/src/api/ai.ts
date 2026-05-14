import { api } from './client';

export async function getSummary(submissionId: string): Promise<{ summary: string; cached: boolean }> {
  return api(`/ai/summarize/${submissionId}`, { method: 'POST' });
}
