import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/dashboard/stats', { preHandler: [requireAuth] }, async () => {
    const db = getDb();
    const totalProjects = await db.collection('projects').countDocuments();
    const totalSubmissions = await db.collection('submissions').countDocuments();
    const reviewedSubmissions = await db.collection('submissions').countDocuments({ status: 'reviewed' });
    const openSubmissions = await db.collection('submissions').countDocuments({ status: 'open' });

    const recentSubs = await db.collection('submissions')
      .find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .toArray();

    const recent = await Promise.all(recentSubs.map(async (sub) => {
      let projectName = 'Unknown';
      try {
        const project = await db.collection('projects').findOne(
          { _id: new ObjectId(sub.projectId) },
          { projection: { name: 1 } }
        );
        projectName = project?.name || 'Unknown';
      } catch {
        // projectId might be invalid — leave default
      }

      return {
        _id: sub._id.toString(),
        templateName: sub.templateName,
        projectName,
        username: sub.username,
        status: sub.status,
        submittedAt: sub.submittedAt,
        itemCount: (sub.items || []).length,
      };
    }));

    return {
      totalProjects,
      totalSubmissions,
      reviewedSubmissions,
      openSubmissions,
      recent,
    };
  });
}
