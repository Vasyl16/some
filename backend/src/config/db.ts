import { env } from './env';
import { MongoClient, type Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectDB = async (): Promise<void> => {
  console.log(env.databaseUrl);
  if (!client) {
    client = new MongoClient(env.databaseUrl);
    await client.connect();
    db = client.db();
  }

  const database = getDb();
  await Promise.all([
    database
      .collection('userauths')
      .createIndex({ email: 1 }, { unique: true }),
    database
      .collection('recruiterinfos')
      .createIndex({ userId: 1 }, { unique: true }),
    database
      .collection('jobapplicantinfos')
      .createIndex({ userId: 1 }, { unique: true }),
    database.collection('jobs').createIndex({ userId: 1 }),
    database.collection('applications').createIndex({ jobId: 1 }),
    database
      .collection('applications')
      .createIndex({ userId: 1, jobId: 1 }, { unique: true }),
    database.collection('ratings').createIndex({ receiverId: 1 }),
  ]);
  console.log('MongoDB connected');
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error('Database is not connected. Call connectDB() first.');
  }
  return db;
};

export const getNextSequence = async (name: string): Promise<number> => {
  const database = getDb();
  const result = await database
    .collection<{ _id: string; seq: number }>('counters')
    .findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );

  return result?.seq ?? 1;
};
