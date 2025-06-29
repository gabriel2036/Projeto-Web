// app/api/match/[sessionId]/status/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Função auxiliar para obter o ID do utilizador atual
async function getCurrentUserId(session: any) {
  if (!session?.user?.email) return null;
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return currentUser?.id;
}


export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // 1. Autenticação e Validação Inicial
  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);
  const sessionId = parseInt(params.sessionId, 10);

  if (!currentUserId || isNaN(sessionId)) {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  try {
    // 2. Procura pela sessão de match
    const matchSession = await prisma.matchSession.findUnique({
      where: { id: sessionId },
      select: {
        status: true,
        // Inclui o resultado, se houver algum
        results: {
          include: {
            interest: true, // Inclui os detalhes do filme que deu match
          }
        }
      },
    });

    if (!matchSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    // 3. Devolve o status da sessão
    // Se a sessão estiver concluída, também devolve os detalhes do filme vencedor
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

    // Se a sessão ainda estiver a decorrer, apenas devolve o status
    return NextResponse.json({ status: matchSession.status });

  } catch (error) {
    console.error("Erro ao verificar status da sessão:", error);
    return NextResponse.json({ error: 'Não foi possível verificar o status da sessão.' }, { status: 500 });
  }
}
