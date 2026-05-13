import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

export interface MediaDoc {
  _id: ObjectId;
  filename: string;
  mimeType: string;
  size: number;
  storage: 'local' | 's3';
  path: string;
  uploadedBy: string;
  createdAt: Date;
}

export async function createMedia(doc: Omit<MediaDoc, '_id'>): Promise<MediaDoc> {
  const result = await getDb().collection<MediaDoc>('media.files').insertOne(doc as MediaDoc);
  return { ...doc, _id: result.insertedId };
}

export async function findMediaById(id: string): Promise<MediaDoc | null> {
  return getDb().collection<MediaDoc>('media.files').findOne({ _id: new ObjectId(id) });
}

export async function deleteMedia(id: string): Promise<void> {
  await getDb().collection<MediaDoc>('media.files').deleteOne({ _id: new ObjectId(id) });
}
