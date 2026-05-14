import type { StorageAdapter } from './interface.js';

export class S3StorageAdapter implements StorageAdapter {
  async upload(_file: Buffer, _filename: string, _mimeType: string): Promise<{ fileId: string; url: string }> {
    throw new Error('S3 not configured yet — install @aws-sdk/client-s3 and configure credentials');
  }

  async getUrl(_fileId: string): Promise<string> {
    throw new Error('S3 not configured yet — install @aws-sdk/client-s3 and configure credentials');
  }

  async delete(_fileId: string): Promise<void> {
    throw new Error('S3 not configured yet — install @aws-sdk/client-s3 and configure credentials');
  }
}
