import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { DocumentModel } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const docs = await DocumentModel.find().sort({ createdAt: -1 });
      return res.json(docs);
    }

    if (req.method === 'POST') {
      const id = req.body.id || `DOC-${Date.now().toString().slice(-3)}`;
      const newDoc = new DocumentModel({ ...req.body, id });
      await newDoc.save();
      return res.status(201).json(newDoc);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
