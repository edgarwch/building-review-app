import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

export interface TemplateDoc {
  _id: ObjectId;
  projectId: string;
  category: string;
  name: string;
  items: Array<{ key: string; label: string; type: 'boolean' | 'text' | 'number' }>;
  createdAt: Date;
}

export async function findByProject(projectId: string): Promise<TemplateDoc[]> {
  return getDb()
    .collection<TemplateDoc>('templates')
    .find({ projectId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findById(id: string): Promise<TemplateDoc | null> {
  return getDb()
    .collection<TemplateDoc>('templates')
    .findOne({ _id: new ObjectId(id) });
}

export async function create(
  projectId: string,
  category: string,
  name: string,
  items: Array<{ key: string; label: string; type: 'boolean' | 'text' | 'number' }>
): Promise<TemplateDoc> {
  const doc = {
    projectId,
    category,
    name,
    items,
    createdAt: new Date(),
  } satisfies Omit<TemplateDoc, '_id'>;
  const result = await getDb().collection<TemplateDoc>('templates').insertOne(doc as TemplateDoc);
  return { ...doc, _id: result.insertedId } as TemplateDoc;
}

export async function update(
  id: string,
  category: string,
  name: string,
  items: Array<{ key: string; label: string; type: 'boolean' | 'text' | 'number' }>
): Promise<number> {
  const result = await getDb()
    .collection<TemplateDoc>('templates')
    .updateOne({ _id: new ObjectId(id) }, { $set: { category, name, items } });
  return result.modifiedCount;
}

export async function remove(id: string): Promise<number> {
  const result = await getDb()
    .collection<TemplateDoc>('templates')
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}
