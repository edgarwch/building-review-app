import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../../config.js';
import type { StorageAdapter } from './interface.js';

export class LocalStorageAdapter implements StorageAdapter {
  constructor() {
    const dir = path.resolve(config.uploadDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async upload(
    file: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<{ fileId: string; url: string }> {
    const ext = path.extname(originalFilename);
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(path.resolve(config.uploadDir), filename);

    fs.writeFileSync(filePath, file);

    const fileId = filename;
    const url = `/uploads/${filename}`;
    return { fileId, url };
  }

  async getUrl(fileId: string): Promise<string> {
    const filePath = path.join(path.resolve(config.uploadDir), fileId);
    if (!fs.existsSync(filePath)) {
      throw Object.assign(new Error('File not found on disk'), { statusCode: 404 });
    }
    return `/uploads/${fileId}`;
  }

  async delete(fileId: string): Promise<void> {
    const filePath = path.join(path.resolve(config.uploadDir), fileId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
