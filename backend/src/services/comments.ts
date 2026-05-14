import * as commentRepo from '../repositories/comments.js';

export async function listComments(submissionId: string) {
  return commentRepo.findBySubmission(submissionId);
}

export async function addComment(
  submissionId: string,
  userId: string,
  username: string,
  text: string
) {
  return commentRepo.create(submissionId, userId, username, text);
}

export async function deleteComment(id: string, userId: string) {
  const modified = await commentRepo.remove(id);
  if (modified === 0) {
    throw Object.assign(new Error('Comment not found'), { statusCode: 404 });
  }
  return modified;
}
