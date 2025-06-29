// app/api/match/[sessionId]/status/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getCurrentUserId(session: any) {
  if (!session?.user?.email) return null;
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return currentUser?.id;
}


export async function GET(
  request: NextRequest
) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const sessionId = parseInt(pathSegments[3], 10);

  const session = await getServerSession(authOptions);
  const currentUserId = await getCurrentUserId(session);

  if (!currentUserId || isNaN(sessionId)) {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  try {
    const matchSession = await prisma.matchSession.findUnique({
      where: { id: sessionId },
      select: {
        status: true,
        results: {
          include: {
            interest: true,
          }
        }
      },
    });

    if (!matchSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }
    
    if (matchSession.status === 'COMPLETED' && matchSession.results.length > 0) {
      const winningMovie = matchSession.results[0].interest;
      
      const apiKey = process.env.TMDB_API_KEY;
      const tmdbDetailsUrl = `https://api.themoviedb.org/3/movie/${winningMovie.id}?api_key=${apiKey}&language=pt-BR`;
      const detailsResponse = await fetch(tmdbDetailsUrl);
      const movieDetails = await detailsResponse.json();

      // --- CORREÇÃO AQUI ---
      // Verificamos se 'movieDetails.overview' tem conteúdo. Se não, usamos uma mensagem padrão.
      const overviewText = movieDetails.overview && movieDetails.overview.trim() !== "" 
        ? movieDetails.overview 
        : "Oops! Parece que este filme não tem uma descrição disponível em português.";

      return NextResponse.json({
        status: 'COMPLETED',
        movie: {
          id: winningMovie.id,
          name: winningMovie.name,
          imageUrl: winningMovie.imageUrl,
          overview: overviewText, // Usamos o texto verificado
          year: movieDetails.release_date ? movieDetails.release_date.split("-")[0] : null,
        }
      });
    }

    return NextResponse.json({ status: matchSession.status });

  } catch (error) {
    console.error("Erro ao verificar status da sessão:", error);
    return NextResponse.json({ error: 'Não foi possível verificar o status da sessão.' }, { status: 500 });
  }
}
