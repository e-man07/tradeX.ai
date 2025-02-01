import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chatId } = req.query;

  if (req.method === 'POST') {
    const { content, sender, metadata } = req.body;
    
    try {
      const message = await prisma.message.create({
        data: {
          content,
          sender,
          metadata,
          chatId: chatId as string,
        },
      });

      // Update chat's updatedAt
      await prisma.chat.update({
        where: { id: chatId as string },
        data: { updatedAt: new Date() },
      });

      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ error: 'Error creating message' });
    }
  } else {
    res.status(405).end();
  }
}