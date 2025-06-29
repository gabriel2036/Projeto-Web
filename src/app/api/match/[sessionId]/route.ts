// app/api/match/[sessionId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Função auxiliar para obter o ID do utilizador atual a partir da sessão
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

  if (!currentUserId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (isNaN(sessionId)) {
    return NextResponse.json({ error: 'ID da sessão inválido' }, { status: 400 });
  }

  try {
    // 2. Buscar todos os participantes da sessão
    const participants = await prisma.matchParticipant.findMany({
      where: { sessionId },
      select: { userId: true },
    });

    // 2.1. Verificar se o utilizador atual faz parte desta sessão
    if (!participants.some(p => p.userId === currentUserId)) {
      return NextResponse.json({ error: 'Você não é um participante desta sessão.' }, { status: 403 });
    }

    const participantIds = participants.map(p => p.userId);

    // 3. Buscar os interesses (filmes) de todos os participantes
    const interestsByParticipant = await Promise.all(
      participantIds.map(id => 
        prisma.userInterest.findMany({
          where: { userId: id },
          select: { interest: true }, // Seleciona os detalhes completos do interesse
        })
      )
    );

    if (interestsByParticipant.length === 0) {
      return NextResponse.json([]); // Retorna uma lista vazia se não houver interesses
    }
    
    // 4. Calcular a interseção: encontrar os filmes que são comuns a todos
    
    // Pega a lista de interesses do primeiro participante como base
    const baseInterests = new Set(interestsByParticipant[0].map(i => i.interest.id));
    
    // Filtra essa lista, mantendo apenas os interesses que existem nas listas dos outros participantes
    const commonInterestIds = interestsByParticipant.slice(1).reduce((common, currentList) => {
      const currentIds = new Set(currentList.map(i => i.interest.id));
      return new Set([...common].filter(id => currentIds.has(id)));
    }, baseInterests);

    // Busca os detalhes completos dos filmes em comum
    const commonMovies = await prisma.interest.findMany({
      where: {
        id: { in: [...commonInterestIds] },
      },
    });

    // 5. Devolve a lista de filmes em comum para o frontend
    return NextResponse.json(commonMovies);

  } catch (error) {
    console.error("Erro ao carregar sessão de match:", error);
    return NextResponse.json({ error: 'Não foi possível carregar os dados da sessão.' }, { status: 500 });
  }
}
