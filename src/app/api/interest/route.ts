// app/api/interest/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Importa as opções de autenticação

const prisma = new PrismaClient();

// GET: Função para obter os interesses do utilizador autenticado
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Encontra o utilizador no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        // Inclui os interesses relacionados a este utilizador
        interests: {
          include: {
            interest: true, // Inclui os detalhes de cada interesse (nome, imagem, etc.)
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    // Mapeia o resultado para devolver apenas o nome de cada interesse
    const interestNames = user.interests.map(userInterest => userInterest.interest.name);
    return NextResponse.json(interestNames);

  } catch (error) {
    console.error("Erro ao obter interesses:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: Função para adicionar um novo interesse para o utilizador
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { name, imageUrl } = await request.json(); // Espera receber o nome e a URL da imagem do filme
    
    // Encontra o ID do utilizador
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    // Procura se o interesse (filme) já existe na tabela 'Interest'.
    // Se não existir, cria um novo. A função 'upsert' faz isso automaticamente.
    const interest = await prisma.interest.upsert({
      where: { name: name },
      update: {}, // Não atualiza nada se já existir
      create: { name: name, imageUrl: imageUrl },
    });

    // Cria a ligação na tabela 'UserInterest'
    await prisma.userInterest.create({
      data: {
        userId: user.id,
        interestId: interest.id,
        type: 'like', // Podemos definir um tipo, como 'like'
      },
    });

    return NextResponse.json({ message: 'Interesse adicionado com sucesso' }, { status: 201 });

  } catch (error) {
    // Se a ligação já existir, o prisma dará um erro. Podemos tratá-lo como um sucesso silencioso.
    console.log("Aviso: Tentativa de adicionar interesse duplicado.");
    return NextResponse.json({ message: 'Interesse já existia' }, { status: 200 });
  }
}

// DELETE: Função para remover um interesse do utilizador
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { name } = await request.json(); // Espera receber o nome do interesse a ser removido

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });

    const interest = await prisma.interest.findUnique({ where: { name } });
    if (!interest) return NextResponse.json({ error: 'Interesse não encontrado' }, { status: 404 });

    // Remove a ligação na tabela 'UserInterest'
    await prisma.userInterest.delete({
      where: {
        userId_interestId: {
          userId: user.id,
          interestId: interest.id,
        },
      },
    });
    
    return NextResponse.json({ message: 'Interesse removido com sucesso' });

  } catch (error) {
    console.error("Erro ao remover interesse:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}