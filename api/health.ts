import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './_lib/db';
import { ProjectModel } from './_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  const isConnected = ProjectModel.db?.readyState === 1;
  res.json({
    status: isConnected ? 'online' : 'connecting',
    database: 'MongoDB Atlas',
    cluster: 'cluster0.oe0akin.mongodb.net',
    dbName: 'edmprojectmanagementdb',
  });
}
