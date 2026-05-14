import { FastifyInstance } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import { requireAuth, type JwtPayload } from '../middleware/auth.js';
import * as mediaService from '../services/media.js';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB
    },
  });

  // Upload media file
  app.post(
    '/api/media/upload',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ error: 'bad_request', message: 'No file provided' });
      }

      const buffer = await file.toBuffer();
      const user = request.user as JwtPayload;

      const result = await mediaService.uploadFile(
        {
          buffer,
          filename: file.filename,
          mimeType: file.mimetype,
        },
        user.sub
      );

      return reply.status(201).send(result);
    }
  );

  // Get media info
  app.get(
    '/api/media/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const url = await mediaService.getFileUrl(id);
      return { fileId: id, url };
    }
  );

  // Serve uploaded files from local storage (no auth — files are public by URL)
  app.get('/uploads/:filename', async (request, reply) => {
    const { filename } = request.params as { filename: string };
    const filePath = path.join(path.resolve(config.uploadDir), filename);

    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ error: 'not_found', message: 'File not found' });
    }

    const stream = fs.createReadStream(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.heic': 'image/heic',
    };

    return reply.type(mimeTypes[ext] || 'application/octet-stream').send(stream);
  });
}
