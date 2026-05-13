import { createStorageAdapter } from '../adapters/storage/index.js';
import * as mediaRepo from '../repositories/media.js';

export async function uploadFile(
  file: { buffer: Buffer; filename: string; mimeType: string },
  userId: string
): Promise<{ fileId: string; url: string }> {
  const adapter = createStorageAdapter();
  const { fileId, url } = await adapter.upload(file.buffer, file.filename, file.mimeType);

  const mediaDoc = await mediaRepo.createMedia({
    filename: file.filename,
    mimeType: file.mimeType,
    size: file.buffer.length,
    storage: 'local' as const,
    path: fileId,
    uploadedBy: userId,
    createdAt: new Date(),
  });

  return { fileId: mediaDoc._id.toString(), url };
}

export async function getFileUrl(mediaId: string): Promise<string> {
  const doc = await mediaRepo.findMediaById(mediaId);
  if (!doc) {
    throw Object.assign(new Error('Media not found'), { statusCode: 404 });
  }
  const adapter = createStorageAdapter();
  const url = await adapter.getUrl(doc.path);
  return url;
}
