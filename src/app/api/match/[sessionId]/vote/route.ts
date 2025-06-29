// app/api/match/[sessionId]/vote/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, MatchAction } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

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


export async function POST(
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
    const body = await request.json();
    const { interestId, action }: { interestId: number, action: MatchAction } = body;

    if (!interestId || !action || !Object.values(MatchAction).includes(action)) {
        return NextResponse.json({ error: 'Dados do voto inválidos' }, { status: 400 });
    }

    // 2. Verificar se o utilizador é um participante válido desta sessão
    const participant = await prisma.matchParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: sessionId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Você não é um participante desta sessão de match.' }, { status: 403 });
    }

    // 3. Registar o voto do utilizador
    // Usamos 'upsert' para permitir que um utilizador mude o seu voto (de recusado para aceite, por exemplo)
    await prisma.matchVote.upsert({
      where: {
        sessionId_userId_interestId: {
          sessionId,
          userId: currentUserId,
          interestId,
        },
      },
      update: { action },
      create: { sessionId, userId: currentUserId, interestId, action },
    });
    
    // 4. Se o voto foi 'ACCEPTED', verificar se ocorreu um "Match"
    if (action === MatchAction.ACCEPTED) {
      // 4.1. Contar quantos participantes existem na sessão
      const totalParticipants = await prisma.matchParticipant.count({
        where: { sessionId },
      });

      // 4.2. Contar quantos votos 'ACCEPTED' existem para este filme nesta sessão
      const acceptedVotes = await prisma.matchVote.count({
        where: {
          sessionId,
          interestId,
          action: MatchAction.ACCEPTED,
        },
      });

      // 4.3. Se o número de votos for igual ao de participantes, deu MATCH!
      if (totalParticipants > 1 && totalParticipants === acceptedVotes) {
        // Guarda o resultado e obtém os detalhes do filme
        const matchResult = await prisma.matchResult.create({
          data: {
            sessionId,
            interestId,
          },
          include: {
            interest: true, // Inclui os detalhes do filme que deu match
          }
        });

        // Devolve uma resposta especial para o frontend
        return NextResponse.json({
          matchFound: true,
          movie: {
            name: matchResult.interest.name,
            imageUrl: matchResult.interest.imageUrl
          },
        });
      }
    }

    // 5. Se não houve match, apenas confirma que o voto foi registado
    return NextResponse.json({ message: 'Voto registado com sucesso.' });

  } catch (error) {
    console.error("Erro ao registar voto:", error);
    return NextResponse.json({ error: 'Não foi possível registar o voto.' }, { status: 500 });
  }
}
