import { MongoClient, Db } from 'mongodb';
import { config } from './config.js';

let db: Db;

export async function connectDb(): Promise<Db> {
  const client = new MongoClient(config.mongoUri);
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('Database not connected');
  return db;
}
