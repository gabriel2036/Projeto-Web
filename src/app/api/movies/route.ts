// app/api/movies/route.ts
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Chave da API do TMDb não configurada' }, { status: 500 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const movieId = searchParams.get('id'); // NOVO: Parâmetro para o ID do filme

  let tmdbUrl = '';

  // NOVO: Se um ID de filme for fornecido, busca os detalhes desse filme
  if (movieId) {
    tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-BR`;
  }
  // Se houver um termo de pesquisa, monta a URL para pesquisar
  else if (query) {
    tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}&include_adult=false`;
  } else {
    // Caso contrário, busca os filmes populares
    tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
  }

  try {
    const tmdbResponse = await fetch(tmdbUrl);
    if (!tmdbResponse.ok) {
        const errorData = await tmdbResponse.json();
        throw new Error(errorData.status_message || 'Erro ao comunicar com o TMDb');
    }
    
    const tmdbData = await tmdbResponse.json();

    // Se buscámos por ID, devolvemos um único objeto com os detalhes
    if (movieId) {
      const movieDetails = {
        id: tmdbData.id,
        title: tmdbData.title,
        overview: tmdbData.overview, // A descrição que queremos!
        poster_path: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null,
        year: tmdbData.release_date ? tmdbData.release_date.split("-")[0] : null,
      };
      return NextResponse.json(movieDetails);
    }
    
    // Se foi uma lista, formatamos como antes
    const movies = tmdbData.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      year: movie.release_date ? movie.release_date.split("-")[0] : null,
    }));

    return NextResponse.json(movies);

  } catch (error) {
    console.error("Erro ao buscar filmes do TMDb:", error);
    return NextResponse.json({ error: 'Não foi possível obter os filmes.' }, { status: 502 });
  }
}
