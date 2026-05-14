import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

export interface ProjectDoc {
  _id: ObjectId;
  name: string;
  address: string;
  createdBy: string;
  createdAt: Date;
}

export async function findAll(): Promise<ProjectDoc[]> {
  return getDb()
    .collection<ProjectDoc>('projects')
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findById(id: string): Promise<ProjectDoc | null> {
  return getDb()
    .collection<ProjectDoc>('projects')
    .findOne({ _id: new ObjectId(id) });
}

export async function create(
  name: string,
  address: string,
  createdBy: string
): Promise<ProjectDoc> {
  const doc = {
    name,
    address,
    createdBy,
    createdAt: new Date(),
  } satisfies Omit<ProjectDoc, '_id'>;
  const result = await getDb().collection<ProjectDoc>('projects').insertOne(doc as ProjectDoc);
  return { ...doc, _id: result.insertedId } as ProjectDoc;
}

export async function update(
  id: string,
  name: string,
  address: string
): Promise<number> {
  const result = await getDb()
    .collection<ProjectDoc>('projects')
    .updateOne({ _id: new ObjectId(id) }, { $set: { name, address } });
  return result.modifiedCount;
}

export async function remove(id: string): Promise<number> {
  const result = await getDb()
    .collection<ProjectDoc>('projects')
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}
