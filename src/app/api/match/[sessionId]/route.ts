// app/api/match/[sessionId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Função para buscar o ID do TMDB pelo nome do filme
async function getTmdbIdByName(movieName: string): Promise<number | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(movieName)}&include_adult=false`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Retorna o ID do primeiro resultado (mais relevante)
    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar ID do TMDB:', error);
    return null;
  }
}

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
    const participants = await prisma.matchParticipant.findMany({
      where: { sessionId },
      select: { userId: true },
    });

    if (!participants.some(p => p.userId === currentUserId)) {
      return NextResponse.json({ error: 'Você não é um participante desta sessão.' }, { status: 403 });
    }

    const participantIds = participants.map(p => p.userId);
    
    const interestsByParticipant = await Promise.all(
      participantIds.map(id => 
        prisma.userInterest.findMany({
          where: { userId: id },
          select: { interest: true },
        })
      )
    );

    if (interestsByParticipant.length === 0) {
      return NextResponse.json([]);
    }
    
    const baseInterests = new Set(interestsByParticipant[0].map(i => i.interest.id));
    
    const commonInterestIds = interestsByParticipant.slice(1).reduce((common, currentList) => {
      const currentIds = new Set(currentList.map(i => i.interest.id));
      return new Set([...common].filter(id => currentIds.has(id)));
    }, baseInterests);

    const commonMovies = await prisma.interest.findMany({
      where: {
        id: { in: [...commonInterestIds] },
      },
    });

    // Mapear os filmes para incluir o ID do TMDB
    const moviesWithTmdbId = await Promise.all(
      commonMovies.map(async (movie) => {
        const tmdbId = await getTmdbIdByName(movie.name);
        return {
          id: tmdbId || movie.id, // Usa o ID do TMDB se encontrado, senão usa o ID do banco
          name: movie.name,
          imageUrl: movie.imageUrl,
          tmdbId, // Campo adicional para debug
          originalId: movie.id, // ID original do banco para referência
        };
      })
    );

    return NextResponse.json(moviesWithTmdbId);

  } catch (error) {
    console.error("Erro ao carregar sessão de match:", error);
    return NextResponse.json({ error: 'Não foi possível carregar os dados da sessão.' }, { status: 500 });
  }
}
