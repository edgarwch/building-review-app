import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

export interface CommentDoc {
  _id: ObjectId;
  submissionId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}

export async function findBySubmission(submissionId: string): Promise<CommentDoc[]> {
  return getDb()
    .collection<CommentDoc>('comments')
    .find({ submissionId })
    .sort({ createdAt: 1 })
    .toArray();
}

export async function create(
  submissionId: string,
  userId: string,
  username: string,
  text: string
): Promise<CommentDoc> {
  const doc: CommentDoc = {
    _id: new ObjectId(),
    submissionId,
    userId,
    username,
    text,
    createdAt: new Date(),
  };
  await getDb().collection<CommentDoc>('comments').insertOne(doc);
  return doc;
}

export async function remove(id: string): Promise<number> {
  const result = await getDb()
    .collection<CommentDoc>('comments')
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
}
