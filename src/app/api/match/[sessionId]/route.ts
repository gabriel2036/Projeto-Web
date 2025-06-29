// app/api/match/[sessionId]/route.ts

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


export async function GET(
  request: NextRequest
) {
  // --- CORREÇÃO DEFINITIVA: Extraímos o ID diretamente do URL ---
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/'); // ex: ['', 'api', 'match', '12', 'status']
  const sessionId = parseInt(pathSegments[3], 10); // O ID da sessão é o 4º segmento

  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId || isNaN(sessionId)) {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  try {
    const participants = await prisma.matchParticipant.findMany({
      where: { sessionId },
      select: { userId: true },
    });

    if (!participants.some(p => p.userId === currentUserId)) {
      return NextResponse.json({ error: 'Você não é um participante desta sessão.' }, { status: 403 });
    }

    const participantIds = participants.map(p => p.userId);
    
    const interestsByParticipant = await Promise.all(
      participantIds.map(id => 
        prisma.userInterest.findMany({
          where: { userId: id },
          select: { interest: true },
        })
      )
    );

    if (interestsByParticipant.length === 0) {
      return NextResponse.json([]);
    }
    
    const baseInterests = new Set(interestsByParticipant[0].map(i => i.interest.id));
    
    const commonInterestIds = interestsByParticipant.slice(1).reduce((common, currentList) => {
      const currentIds = new Set(currentList.map(i => i.interest.id));
      return new Set([...common].filter(id => currentIds.has(id)));
    }, baseInterests);

    const commonMovies = await prisma.interest.findMany({
      where: {
        id: { in: [...commonInterestIds] },
      },
    });

    return NextResponse.json(commonMovies);

  } catch (error) {
    console.error("Erro ao carregar sessão de match:", error);
    return NextResponse.json({ error: 'Não foi possível carregar os dados da sessão.' }, { status: 500 });
  }
}
