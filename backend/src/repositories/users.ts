import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

export interface UserDoc {
  _id: ObjectId;
  username: string;
  password: string;
  role: 'admin' | 'inspector';
  createdAt: Date;
}

export async function findUserByUsername(username: string): Promise<UserDoc | null> {
  return getDb().collection('users').findOne({ username }) as Promise<UserDoc | null>;
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  return getDb().collection('users').findOne({ _id: new ObjectId(id) }) as Promise<UserDoc | null>;
}

export async function createUser(username: string, passwordHash: string, role: 'admin' | 'inspector'): Promise<UserDoc> {
  const doc = {
    username,
    password: passwordHash,
    role,
    createdAt: new Date(),
  };
  const result = await getDb().collection('users').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}
