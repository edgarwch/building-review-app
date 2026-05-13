import { api } from './client';
import type { Project } from '@app/shared';

export async function listProjects(): Promise<Project[]> {
  return api('/projects');
}

export async function getProject(id: string): Promise<Project> {
  return api(`/projects/${id}`);
}

export async function createProject(name: string, address: string): Promise<Project> {
  return api('/projects', { method: 'POST', body: JSON.stringify({ name, address }) });
}

export async function updateProject(id: string, name: string, address: string): Promise<Project> {
  return api(`/projects/${id}`, { method: 'PUT', body: JSON.stringify({ name, address }) });
}

export async function deleteProject(id: string): Promise<void> {
  return api(`/projects/${id}`, { method: 'DELETE' });
}
