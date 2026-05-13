import { api } from './client';
import type { Comment } from '@app/shared';

export async function listComments(submissionId: string): Promise<Comment[]> {
  return api(`/submissions/${submissionId}/comments`);
}

export async function addComment(submissionId: string, text: string): Promise<Comment> {
  return api(`/submissions/${submissionId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function deleteComment(submissionId: string, commentId: string): Promise<void> {
  return api(`/submissions/${submissionId}/comments/${commentId}`, { method: 'DELETE' });
}
