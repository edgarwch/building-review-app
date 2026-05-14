import { getAccessToken } from './client';

const BASE = '/api';

export async function uploadMedia(file: File): Promise<{ fileId: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }

  return res.json();
}
