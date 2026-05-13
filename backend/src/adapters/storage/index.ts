import { config } from '../../config.js';
import type { StorageAdapter } from './interface.js';
import { LocalStorageAdapter } from './local.js';
import { S3StorageAdapter } from './s3.js';

export function createStorageAdapter(): StorageAdapter {
  if (config.storageBackend === 's3') return new S3StorageAdapter();
  return new LocalStorageAdapter();
}
