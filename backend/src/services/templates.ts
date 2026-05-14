import * as templateRepo from '../repositories/templates.js';

export async function listByProject(projectId: string) {
  return templateRepo.findByProject(projectId);
}

export async function getTemplate(id: string) {
  const template = await templateRepo.findById(id);
  if (!template) {
    throw Object.assign(new Error('Template not found'), { statusCode: 404 });
  }
  return template;
}

export async function createTemplate(
  projectId: string,
  category: string,
  name: string,
  items: Array<{ key: string; label: string; type: 'boolean' | 'text' | 'number' }>
) {
  return templateRepo.create(projectId, category, name, items);
}

export async function updateTemplate(
  id: string,
  category: string,
  name: string,
  items: Array<{ key: string; label: string; type: 'boolean' | 'text' | 'number' }>
) {
  const modified = await templateRepo.update(id, category, name, items);
  if (modified === 0) {
    throw Object.assign(new Error('Template not found'), { statusCode: 404 });
  }
  return modified;
}

export async function deleteTemplate(id: string) {
  const deleted = await templateRepo.remove(id);
  if (deleted === 0) {
    throw Object.assign(new Error('Template not found'), { statusCode: 404 });
  }
  return deleted;
}
