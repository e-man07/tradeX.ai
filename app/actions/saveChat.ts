"use server";
import { PrismaClient } from "@prisma/client";
import { Message } from "@/hooks/ChatContext";

export const saveChat = async (userId: string, messages: Message[]) => {
  const prisma = new PrismaClient();
  try {
    const response = await prisma.chat.create({
      data: {
        userId,
        messages: {
          create: messages.map((message) => ({
            sender: message.sender,
            content: message.content,
            chatId: message.chatId || null,
          })),
        },
      },
    });
    return response;
  } catch (err) {
    console.error(err);
  }
};
