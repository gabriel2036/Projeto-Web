// app/api/match/start/route.ts

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


export async function POST(request: NextRequest) {
  // 1. Autenticação: Garante que apenas um utilizador autenticado pode criar uma sessão.
  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // 2. Recebe a lista de IDs dos amigos do corpo do pedido.
    const body = await request.json();
    const { friendIds } = body;

    if (!friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
      return NextResponse.json({ error: 'É necessária uma lista de IDs de amigos.' }, { status: 400 });
    }

    // 3. Usa uma transação do Prisma para garantir a integridade dos dados.
    //    Isto significa que todas as operações seguintes ou são bem-sucedidas em conjunto, ou falham em conjunto.
    const newMatchSession = await prisma.$transaction(async (tx) => {
      // 3.1. Cria a sessão de match, definindo o utilizador atual como o criador.
      const session = await tx.matchSession.create({
        data: {
          creatorId: currentUserId,
          // O status 'VOTING' é o padrão, por isso não precisamos de o definir.
        }
      });

      // 3.2. Prepara os dados para todos os participantes (o criador + os amigos convidados).
      const participantIds = [currentUserId, ...friendIds];
      const participantData = participantIds.map(id => ({
        sessionId: session.id,
        userId: id
      }));

      // 3.3. Adiciona todos os participantes à sessão de uma só vez.
      await tx.matchParticipant.createMany({
        data: participantData
      });

      // Devolve a sessão criada para que possamos usar o seu ID.
      return session;
    });

    // 4. Se tudo correu bem, devolve o ID da nova sessão para o frontend.
    return NextResponse.json({ sessionId: newMatchSession.id }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar sessão de match:", error);
    return NextResponse.json({ error: 'Não foi possível criar a sessão de match.' }, { status: 500 });
  }
}
