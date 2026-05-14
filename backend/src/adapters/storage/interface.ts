export interface StorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<{ fileId: string; url: string }>;
  getUrl(fileId: string): Promise<string>;
  delete(fileId: string): Promise<void>;
}
