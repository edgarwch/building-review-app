import { getAIService } from '../adapters/ai/index.js';
import * as submissionRepo from '../repositories/submissions.js';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

export async function getSummary(submissionId: string): Promise<{ summary: string; cached: boolean }> {
  const ai = getAIService();
  if (!ai) {
    throw Object.assign(new Error('AI summarization not configured'), { statusCode: 404 });
  }

  const sub = await submissionRepo.findById(submissionId);
  if (!sub) {
    throw Object.assign(new Error('Submission not found'), { statusCode: 404 });
  }

  // Check if summary already cached on the submission
  const doc = await getDb().collection('submissions').findOne(
    { _id: new ObjectId(submissionId) },
    { projection: { summary: 1 } }
  );

  if (doc?.summary) {
    return { summary: doc.summary, cached: true };
  }

  // Generate summary
  const summary = await ai.summarize({
    templateName: sub.templateName,
    items: sub.items,
  });

  // Cache it
  await getDb().collection('submissions').updateOne(
    { _id: new ObjectId(submissionId) },
    { $set: { summary } }
  );

  return { summary, cached: false };
}
