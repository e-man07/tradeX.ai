import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pubKey = searchParams.get('pubKey');
  
  if (!pubKey) {
    return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { pubKey },
      include: {
        chats: {
          where: { isArchived: false },
          include: { messages: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ chats: user.chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pubKey } = body;

    if (!pubKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
    }

    // First find the user by pubKey
    const user = await prisma.user.findUnique({
      where: { pubKey },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a new chat for the user
    const chat = await prisma.chat.create({
      data: {
        title: 'New Chat',
        userId: user.id,
        isArchived: false,
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ chat }); 
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}