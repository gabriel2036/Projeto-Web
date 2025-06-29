// app/api/match/start/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getCurrentUserId(session: any) {
  if (!session?.user?.email) return null;
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return currentUser?.id;
}


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { friendIds } = body;
    const friendId = friendIds[0]; 

    if (!friendId) {
      return NextResponse.json({ error: 'ID do amigo em falta.' }, { status: 400 });
    }

    const existingSession = await prisma.matchSession.findFirst({
      where: {
        status: 'VOTING',
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: friendId } } },
        ]
      },
    });

    if (existingSession) {
      return NextResponse.json({ sessionId: existingSession.id }, { status: 200 });
    }

    const newMatchSession = await prisma.$transaction(async (tx) => {
      const session = await tx.matchSession.create({
        data: {
          creatorId: currentUserId,
        }
      });

      const participantIds = [currentUserId, friendId];
      const participantData = participantIds.map(id => ({
        sessionId: session.id,
        userId: id
      }));

      await tx.matchParticipant.createMany({
        data: participantData
      });

      return session;
    });

    return NextResponse.json({ sessionId: newMatchSession.id }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar sessão de match:", error);
    return NextResponse.json({ error: 'Não foi possível criar a sessão de match.' }, { status: 500 });
  }
}
