// app/api/match/[sessionId]/vote/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, MatchAction, MatchSessionStatus } from '@prisma/client';
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


export async function POST(
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
    const body = await request.json();
    const { interestId, action }: { interestId: number, action: MatchAction } = body;

    if (!interestId || !action) {
        return NextResponse.json({ error: 'Dados do voto inválidos' }, { status: 400 });
    }

    const matchSession = await prisma.matchSession.findUnique({
        where: { id: sessionId },
        select: { status: true }
    });

    if (matchSession?.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Esta sessão de match já foi concluída.' }, { status: 403 });
    }

    const participant = await prisma.matchParticipant.findUnique({
      where: { sessionId_userId: { sessionId, userId: currentUserId } },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Você não é um participante desta sessão de match.' }, { status: 403 });
    }

    // --- LÓGICA DE VOTO E VERIFICAÇÃO DE MATCH REATORIZADA DENTRO DE UMA TRANSAÇÃO ---
    // Isto garante que todas as operações são atómicas e consistentes.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Registar o voto do utilizador
      await tx.matchVote.upsert({
        where: { sessionId_userId_interestId: { sessionId, userId: currentUserId, interestId }},
        update: { action },
        create: { sessionId, userId: currentUserId, interestId, action },
      });
      
      // 2. Se o voto foi 'DECLINED', não há necessidade de verificar o match.
      if (action === MatchAction.DECLINED) {
        return null; 
      }

      // 3. Se o voto foi 'ACCEPTED', vamos verificar se um match ocorreu.
      const totalParticipants = await tx.matchParticipant.count({ where: { sessionId } });
      const acceptedVotes = await tx.matchVote.count({ 
        where: { sessionId, interestId, action: MatchAction.ACCEPTED } 
      });

      console.log(`[Sessão ${sessionId}] [Filme ${interestId}] Verificando match...`);
      console.log(`> Participantes Totais: ${totalParticipants}`);
      console.log(`> Votos 'ACCEPTED' para este filme: ${acceptedVotes}`);

      // 4. Se deu MATCH!
      if (totalParticipants > 1 && totalParticipants === acceptedVotes) {
        console.log(`[Sessão ${sessionId}] MATCH ENCONTRADO!`);
        
        // Atualiza o status da sessão para COMPLETED
        await tx.matchSession.update({
          where: { id: sessionId },
          data: { status: MatchSessionStatus.COMPLETED },
        });

        // Guarda o resultado na tabela MatchResult
        const finalResult = await tx.matchResult.create({
          data: { sessionId, interestId },
          include: { interest: true },
        });
        
        // Devolve os dados do filme que deu match
        return finalResult;
      }
      
      // Se não deu match, não devolve nada.
      return null;
    });

    // --- FIM DA TRANSAÇÃO ---

    // Se a transação devolveu um resultado, significa que houve um match.
    if (result) {
      return NextResponse.json({
        matchFound: true,
        movie: {
          name: result.interest.name,
          imageUrl: result.interest.imageUrl
        },
      });
    }

    // Se não, apenas confirma que o voto foi registado.
    return NextResponse.json({ message: 'Voto registado com sucesso.' });

  } catch (error) {
    console.error("Erro ao registar voto:", error);
    return NextResponse.json({ error: 'Não foi possível registar o voto.' }, { status: 500 });
  }
}
