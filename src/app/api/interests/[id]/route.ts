import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const interestId = parseInt(params.id);
    
    if (isNaN(interestId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário tem interesse neste filme
    const userInterest = await prisma.userInterest.findFirst({
      where: {
        userId: user.id,
        interestId: interestId
      },
      include: {
        interest: true
      }
    });

    if (!userInterest) {
      return NextResponse.json({ error: 'Interesse não encontrado para este usuário' }, { status: 404 });
    }

    // Remover o relacionamento UserInterest
    await prisma.userInterest.delete({
      where: {
        userId_interestId: {
          userId: user.id,
          interestId: interestId
        }
      }
    });

    console.log(`🗑️ Interesse removido: ${userInterest.interest.name} (ID: ${interestId}) do usuário ${user.name}`);

    return NextResponse.json({ 
      message: 'Interesse removido com sucesso',
      removedInterest: {
        id: userInterest.interest.id,
        name: userInterest.interest.name
      }
    });

  } catch (error) {
    console.error('Erro ao remover interesse:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
