// app/api/friends/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, FriendshipStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Função para obter o ID do utilizador atual a partir da sessão
async function getCurrentUserId(session: any) {
  if (!session?.user?.email) return null;
  
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  
  return currentUser?.id;
}


// GET: Função para procurar utilizadores ou listar pedidos de amizade
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type'); // ex: 'requests'

  try {
    // Listar pedidos de amizade pendentes para o utilizador atual
    if (type === 'requests') {
      const requests = await prisma.friendship.findMany({
        where: {
          addresseeId: currentUserId,
          status: 'PENDING',
        },
        include: {
          requester: { // Inclui os dados de quem enviou o pedido
            select: { id: true, name: true, email: true },
          },
        },
      });
      return NextResponse.json(requests);
    }
    
    // Procurar por novos utilizadores para adicionar
    if (query) {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { name: { contains: query, mode: 'insensitive' } },
            { id: { not: currentUserId } }, // Não se pode procurar por si mesmo
          ]
        },
        select: { id: true, name: true, email: true },
        take: 10, // Limita o número de resultados
      });
      return NextResponse.json(users);
    }
    
    return NextResponse.json({ error: 'Tipo de pedido inválido' }, { status: 400 });

  } catch (error) {
    console.error("Erro na API de amigos (GET):", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: Enviar um novo pedido de amizade
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const requesterId = await getCurrentUserId(session);

    if (!requesterId) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { addresseeId } = await request.json(); // ID do utilizador a quem se envia o pedido

    if (requesterId === addresseeId) {
        return NextResponse.json({ error: 'Não pode adicionar a si mesmo' }, { status: 400 });
    }

    try {
        const newFriendship = await prisma.friendship.create({
            data: {
                requesterId: requesterId,
                addresseeId: addresseeId,
                status: FriendshipStatus.PENDING,
            }
        });
        return NextResponse.json(newFriendship, { status: 201 });
    } catch (error) {
        console.error("Erro ao enviar pedido de amizade:", error);
        return NextResponse.json({ error: 'Não foi possível enviar o pedido. O utilizador já pode ter sido adicionado.' }, { status: 409 });
    }
}

// PUT: Aceitar ou recusar um pedido de amizade
export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const currentUserId = await getCurrentUserId(session);

    if (!currentUserId) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { requesterId, status } = await request.json(); // ID de quem enviou o pedido e o novo status ('ACCEPTED' ou 'DECLINED')

    const newStatus = status.toUpperCase() === 'ACCEPTED' ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED;

    try {
        const updatedFriendship = await prisma.friendship.update({
            where: {
                requesterId_addresseeId: {
                    requesterId: requesterId,
                    addresseeId: currentUserId, // Garante que só o destinatário pode responder
                }
            },
            data: {
                status: newStatus,
            }
        });
        return NextResponse.json(updatedFriendship);
    } catch (error) {
        console.error("Erro ao responder ao pedido de amizade:", error);
        return NextResponse.json({ error: 'Não foi possível responder ao pedido.' }, { status: 500 });
    }
}
