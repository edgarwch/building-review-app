import { api } from './client';
import type { Template } from '@app/shared';

export async function listProjectTemplates(projectId: string): Promise<Template[]> {
  return api(`/projects/${projectId}/templates`);
}

export async function getTemplate(id: string): Promise<Template> {
  return api(`/templates/${id}`);
}

export async function createTemplate(
  projectId: string,
  category: string,
  name: string,
  items: Array<{ key: string; label: string; type: 'boolean' | 'text' | 'number' }>
): Promise<Template> {
  return api(`/projects/${projectId}/templates`, {
    method: 'POST',
    body: JSON.stringify({ category, name, items }),
  });
}

export async function updateTemplate(
  id: string,
  projectId: string,
  category: string,
  name: string,
  items: Array<{ key: string; label: string; type: 'boolean' | 'text' | 'number' }>
): Promise<void> {
  return api(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ projectId, category, name, items }),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  return api(`/templates/${id}`, { method: 'DELETE' });
}
