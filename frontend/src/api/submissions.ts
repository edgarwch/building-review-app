import { api } from './client';
import type { Submission } from '@app/shared';

export async function listSubmissions(params?: { projectId?: string; status?: string }): Promise<Submission[]> {
  const query = new URLSearchParams();
  if (params?.projectId) query.set('projectId', params.projectId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return api(`/submissions${qs ? `?${qs}` : ''}`);
}

export async function getSubmission(id: string): Promise<Submission> {
  return api(`/submissions/${id}`);
}

export async function submitChecklist(data: {
  projectId: string;
  templateId: string;
  templateName: string;
  items: { tool: string; details: string }[];
}): Promise<Submission> {
  return api('/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function reviewSubmission(id: string): Promise<void> {
  return api(`/submissions/${id}/review`, { method: 'POST' });
}

export async function reopenSubmission(id: string): Promise<void> {
  return api(`/submissions/${id}/review`, { method: 'DELETE' });
}

export interface DashboardStats {
  totalProjects: number;
  totalSubmissions: number;
  reviewedSubmissions: number;
  openSubmissions: number;
  recent: {
    _id: string;
    templateName: string;
    projectName: string;
    username: string;
    status: string;
    submittedAt: string;
    itemCount: number;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return api('/dashboard/stats');
}
