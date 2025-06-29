// app/api/match/[sessionId]/status/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
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


export async function GET(
  request: NextRequest
) {
  // --- CORREÇÃO DEFINITIVA: Extraímos o ID diretamente do URL ---
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const sessionId = parseInt(pathSegments[3], 10);

  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId || isNaN(sessionId)) {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  try {
    const matchSession = await prisma.matchSession.findUnique({
      where: { id: sessionId },
      select: {
        status: true,
        results: {
          include: {
            interest: true,
          }
        }
      },
    });

    if (!matchSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }
    
    if (matchSession.status === 'COMPLETED' && matchSession.results.length > 0) {
      const winningMovie = matchSession.results[0].interest;
      return NextResponse.json({
        status: 'COMPLETED',
        movie: {
          id: winningMovie.id,
          name: winningMovie.name,
          imageUrl: winningMovie.imageUrl
        }
      });
    }

    return NextResponse.json({ status: matchSession.status });

  } catch (error) {
    console.error("Erro ao verificar status da sessão:", error);
    return NextResponse.json({ error: 'Não foi possível verificar o status da sessão.' }, { status: 500 });
  }
}
