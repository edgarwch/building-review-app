import bcrypt from 'bcryptjs';
import { findUserByUsername, createUser, findUserById } from '../repositories/users.js';
import { config } from '../config.js';

export async function registerUser(username: string, password: string, role: 'admin' | 'inspector' = 'inspector') {
  const existing = await findUserByUsername(username);
  if (existing) {
    throw Object.assign(new Error('Username already exists'), { statusCode: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  return createUser(username, hash, role);
}

export async function loginUser(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }
  return user;
}

export function generateTokens(app: any, user: { _id: any; username: string; role: string }) {
  const sub = user._id.toString();
  const accessToken = app.jwt.sign(
    { sub, username: user.username, role: user.role },
    { expiresIn: '15m' }
  );
  const refreshToken = app.jwt.sign(
    { sub, type: 'refresh' },
    { secret: config.jwtRefreshSecret, expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

export async function refreshAccessToken(app: any, refreshToken: string) {
  try {
    const decoded = app.jwt.verify(refreshToken, { secret: config.jwtRefreshSecret });
    if (decoded.type !== 'refresh') throw new Error('Wrong token type');
    const user = await findUserById(decoded.sub);
    if (!user) throw new Error('User not found');
    return generateTokens(app, user);
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
  }
}
