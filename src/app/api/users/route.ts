// app/api/users/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; 

// Inicializa o cliente do Prisma
const prisma = new PrismaClient();

// Função para lidar com requisições GET
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: 'Falha ao buscar usuários' }, { status: 500 });
  }
}

// Função para lidar com requisições POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

     const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Este email já está em uso.' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword, 
      },
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: 'Falha ao criar usuário' }, { status: 500 });
  }
}