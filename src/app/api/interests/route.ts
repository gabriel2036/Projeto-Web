// app/api/interest/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; 

const prisma = new PrismaClient();

// GET: Função para obter os interesses do utilizador autenticado
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        interests: {
          include: {
            interest: true, 
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    const interestNames = user.interests.map(userInterest => userInterest.interest.name);
    return NextResponse.json(interestNames);

  } catch (error) {
    console.error("Erro ao obter interesses:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: Função para adicionar um novo interesse 
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { name, imageUrl } = await request.json(); 
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    const interest = await prisma.interest.upsert({
      where: { name: name },
      update: {}, 
      create: { name: name, imageUrl: imageUrl },
    });


    await prisma.userInterest.create({
      data: {
        userId: user.id,
        interestId: interest.id,
        type: 'like',
      },
    });

    return NextResponse.json({ message: 'Interesse adicionado com sucesso' }, { status: 201 });

  } catch (error) {
    console.log("Aviso: Tentativa de adicionar interesse duplicado.");
    return NextResponse.json({ message: 'Interesse já existia' }, { status: 200 });
  }
}

// DELETE: Função para remover um interesse 
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { name } = await request.json(); 

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });

    const interest = await prisma.interest.findUnique({ where: { name } });
    if (!interest) return NextResponse.json({ error: 'Interesse não encontrado' }, { status: 404 });

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