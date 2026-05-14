import { api } from './client';
import type { User, AuthTokens } from '@app/shared';

export async function register(username: string, password: string): Promise<void> {
  await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string): Promise<{ user: User } & AuthTokens> {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function refresh(): Promise<AuthTokens> {
  return api('/auth/refresh', { method: 'POST' });
}

export async function getMe(): Promise<User> {
  return api('/auth/me');
}
