// app/api/match/[sessionId]/vote/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, MatchAction, MatchSessionStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getCurrentUserId(session: any) {
  if (!session?.user?.email) return null;
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return currentUser?.id;
}


export async function POST(
  request: NextRequest
) {
  // CORREÇÃO DEFINITIVA: Extraímos o ID diretamente do URL
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const sessionId = parseInt(pathSegments[3], 10);

  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId || isNaN(sessionId)) {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { interestId, action }: { interestId: number, action: MatchAction } = body;

    const matchSessionCheck = await prisma.matchSession.findUnique({
      where: { id: sessionId },
      select: { status: true }
    });

    if (matchSessionCheck?.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Esta sessão de match já foi concluída.' }, { status: 403 });
    }

    const participant = await prisma.matchParticipant.findUnique({
      where: { sessionId_userId: { sessionId, userId: currentUserId } },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Você não é um participante desta sessão de match.' }, { status: 403 });
    }
    
    const result = await prisma.$transaction(async (tx) => {
      await tx.matchVote.upsert({
        where: { sessionId_userId_interestId: { sessionId, userId: currentUserId, interestId }},
        update: { action },
        create: { sessionId, userId: currentUserId, interestId, action },
      });
      
      if (action === MatchAction.DECLINED) {
        return null; 
      }

      const totalParticipants = await tx.matchParticipant.count({ where: { sessionId } });
      const acceptedVotes = await tx.matchVote.count({ 
        where: { sessionId, interestId, action: MatchAction.ACCEPTED } 
      });

      if (totalParticipants > 1 && totalParticipants === acceptedVotes) {
        await tx.matchSession.update({
          where: { id: sessionId },
          data: { status: MatchSessionStatus.COMPLETED },
        });

        const finalResult = await tx.matchResult.create({
          data: { sessionId, interestId },
          include: { interest: true },
        });
        
        return finalResult;
      }
      
      return null;
    });

    if (result) {
      return NextResponse.json({
        matchFound: true,
        movie: {
          name: result.interest.name,
          imageUrl: result.interest.imageUrl
        },
      });
    }

    return NextResponse.json({ message: 'Voto registado com sucesso.' });

  } catch (error) {
    console.error("Erro ao registar voto:", error);
    return NextResponse.json({ error: 'Não foi possível registar o voto.' }, { status: 500 });
  }
}
