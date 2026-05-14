import * as projectRepo from '../repositories/projects.js';

export async function listProjects() {
  return projectRepo.findAll();
}

export async function getProject(id: string) {
  const project = await projectRepo.findById(id);
  if (!project) {
    throw Object.assign(new Error('Project not found'), { statusCode: 404 });
  }
  return project;
}

export async function createProject(name: string, address: string, userId: string) {
  return projectRepo.create(name, address, userId);
}

export async function updateProject(id: string, name: string, address: string) {
  const modified = await projectRepo.update(id, name, address);
  if (modified === 0) {
    throw Object.assign(new Error('Project not found'), { statusCode: 404 });
  }
  return modified;
}

export async function deleteProject(id: string) {
  const deleted = await projectRepo.remove(id);
  if (deleted === 0) {
    throw Object.assign(new Error('Project not found'), { statusCode: 404 });
  }
  return deleted;
}
