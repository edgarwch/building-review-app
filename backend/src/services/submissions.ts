import * as submissionRepo from '../repositories/submissions.js';
import type { SubmissionStatus } from '@app/shared';

export async function listSubmissions(filters?: { projectId?: string; status?: string }) {
  return submissionRepo.findAll(filters);
}

export async function getSubmission(id: string) {
  const submission = await submissionRepo.findById(id);
  if (!submission) {
    throw Object.assign(new Error('Submission not found'), { statusCode: 404 });
  }
  return submission;
}

export async function createSubmission(data: {
  projectId: string;
  templateId: string;
  templateName: string;
  items: Array<{ tool: string; details: string }>;
  userId: string;
  username: string;
}) {
  const doc = {
    projectId: data.projectId,
    templateId: data.templateId,
    templateName: data.templateName,
    userId: data.userId,
    username: data.username,
    items: data.items,
    media: [],
    status: 'open' as SubmissionStatus,
    submittedAt: new Date(),
  };
  return submissionRepo.create(doc);
}

export async function reviewSubmission(id: string, userId: string) {
  const modified = await submissionRepo.updateStatus(id, 'reviewed', userId);
  if (modified === 0) {
    throw Object.assign(new Error('Submission not found'), { statusCode: 404 });
  }
  return modified;
}

export async function reopenSubmission(id: string, userId: string) {
  const modified = await submissionRepo.updateStatus(id, 'open', userId);
  if (modified === 0) {
    throw Object.assign(new Error('Submission not found'), { statusCode: 404 });
  }
  return modified;
}
