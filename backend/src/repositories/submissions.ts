import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';
import type { SubmissionStatus } from '@app/shared';

export interface SubmissionDoc {
  _id: ObjectId;
  projectId: string;
  templateId: string;
  templateName: string;
  userId: string;
  username: string;
  items: Array<{ tool: string; details: string }>;
  media: Array<{ fileId: string; type: 'photo' | 'video' }>;
  status: SubmissionStatus;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export async function findAll(filters?: { projectId?: string; status?: string }): Promise<SubmissionDoc[]> {
  const query: Record<string, unknown> = {};
  if (filters?.projectId) query.projectId = filters.projectId;
  if (filters?.status) query.status = filters.status;

  return getDb()
    .collection<SubmissionDoc>('submissions')
    .find(query)
    .sort({ submittedAt: -1 })
    .toArray();
}

export async function findById(id: string): Promise<SubmissionDoc | null> {
  return getDb()
    .collection<SubmissionDoc>('submissions')
    .findOne({ _id: new ObjectId(id) });
}

export async function create(
  data: Omit<SubmissionDoc, '_id'>
): Promise<SubmissionDoc> {
  const result = await getDb().collection<SubmissionDoc>('submissions').insertOne(data as SubmissionDoc);
  return { ...data, _id: result.insertedId } as SubmissionDoc;
}

export async function updateStatus(
  id: string,
  status: SubmissionStatus,
  reviewedBy?: string
): Promise<number> {
  const update: Record<string, unknown> = {
    $set: { status },
  };
  if (reviewedBy) {
    update.$set = { ...update.$set as Record<string, unknown>, reviewedBy, reviewedAt: new Date() };
  }
  const result = await getDb()
    .collection<SubmissionDoc>('submissions')
    .updateOne({ _id: new ObjectId(id) }, update);
  return result.modifiedCount;
}
