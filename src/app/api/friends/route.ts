// app/api/friends/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, FriendshipStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

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


// GET: Função para procurar utilizadores, listar pedidos OU listar amigos
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type'); 

  try {
    // Listar pedidos de amizade pendentes
    if (type === 'requests') {
      const requests = await prisma.friendship.findMany({
        where: { addresseeId: currentUserId, status: 'PENDING' },
        include: { requester: { select: { id: true, name: true }}},
      });
      return NextResponse.json(requests);
    }
    
    // Listar amigos já aceitos
    if (type === 'accepted') {
        const friendships = await prisma.friendship.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { requesterId: currentUserId },
                    { addresseeId: currentUserId },
                ],
            },
            include: {
                requester: { select: { id: true, name: true } },
                addressee: { select: { id: true, name: true } },
            }
        });

        const friends = friendships.map(friendship => {
            return friendship.requesterId === currentUserId ? friendship.addressee : friendship.requester;
        });
        
        return NextResponse.json(friends);
    }

    // Procurar por novos utilizadores para adicionar
    if (query) {
      const existingFriendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: currentUserId },
            { addresseeId: currentUserId },
          ],
        },
        select: { requesterId: true, addresseeId: true },
      });

      const idsToExclude = existingFriendships.flatMap(f => [f.requesterId, f.addresseeId]);
      idsToExclude.push(currentUserId); 
      const uniqueIdsToExclude = [...new Set(idsToExclude)];
      
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { name: { contains: query, mode: 'insensitive' } },
            { id: { notIn: uniqueIdsToExclude } } 
          ]
        },
        select: { id: true, name: true, email: true },
        take: 10,
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

    const { addresseeId } = await request.json();

    if (requesterId === addresseeId) {
        return NextResponse.json({ error: 'Não pode adicionar a si mesmo' }, { status: 400 });
    }

    try {
        const newFriendship = await prisma.friendship.create({
            data: { requesterId, addresseeId, status: FriendshipStatus.PENDING }
        });
        return NextResponse.json(newFriendship, { status: 201 });
    } catch (error) {
        console.error("Erro ao enviar pedido de amizade:", error);
        return NextResponse.json({ error: 'Não foi possível enviar o pedido.' }, { status: 409 });
    }
}

// PUT: Aceitar ou RECUSAR um pedido de amizade 
export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const currentUserId = await getCurrentUserId(session);

    if (!currentUserId) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { requesterId, status } = await request.json();

    try {
        if (status.toUpperCase() === 'ACCEPTED') {
            const updatedFriendship = await prisma.friendship.update({
                where: {
                    requesterId_addresseeId: { requesterId, addresseeId: currentUserId }
                },
                data: { status: FriendshipStatus.ACCEPTED }
            });
            return NextResponse.json(updatedFriendship);
        } 
        else if (status.toUpperCase() === 'DECLINED') {
            await prisma.friendship.delete({
                where: {
                    requesterId_addresseeId: { requesterId, addresseeId: currentUserId }
                }
            });
            return NextResponse.json({ message: 'Pedido de amizade recusado e apagado.' });
        }
        else {
            return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
        }
    } catch (error) {
        console.error("Erro ao responder ao pedido de amizade:", error);
        return NextResponse.json({ error: 'Não foi possível responder ao pedido.' }, { status: 500 });
    }
}
// DELETE: Desfazer amizade
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { friendId } = await request.json();

  if (!friendId) {
    return NextResponse.json({ error: "ID do amigo não fornecido" }, { status: 400 });
  }

  try {
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: currentUserId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: currentUserId },
        ],
      },
    });

    return NextResponse.json({ message: "Amizade desfeita com sucesso." });
  } catch (error) {
    console.error("Erro ao desfazer amizade:", error);
    return NextResponse.json({ error: "Erro ao desfazer amizade." }, { status: 500 });
  }
}
