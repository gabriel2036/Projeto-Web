// app/api/movies/route.ts
import { NextResponse, NextRequest } from 'next/server';

// A função GET agora recebe o objeto 'request'. Isso é importante
// para que possamos ler os parâmetros da URL, como o termo de pesquisa.
export async function GET(request: NextRequest) {
  // 1. Pegamos nossa chave de API secreta do arquivo .env. Ela continua segura aqui.
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Chave da API do TMDb não configurada' }, { status: 500 });
  }
  
  // 2. Verificamos se a URL do pedido tem um parâmetro de pesquisa.
  // Exemplo: se a chamada for /api/movies?query=Batman, searchQuery será "Batman".
  const searchQuery = request.nextUrl.searchParams.get('query');
  
  let tmdbUrl = '';

  // 3. Decidimos qual URL do TMDb usar.
  // Esta é a parte que integra a lógica do seu amigo!
  if (searchQuery) {
    // Se HÁ um termo de pesquisa, montamos a URL de PESQUISA.
    tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
  } else {
    // Se NÃO HÁ termo de pesquisa, usamos a URL de POPULARES (nosso comportamento antigo).
    tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
  }

  try {
    // 4. Fazemos a chamada para a URL do TMDb que foi decidida acima.
    const tmdbResponse = await fetch(tmdbUrl);
    if (!tmdbResponse.ok) {
        const errorData = await tmdbResponse.json();
        throw new Error(errorData.status_message || 'Erro ao comunicar com o TMDb');
    }
    
    const tmdbData = await tmdbResponse.json();

    // 5. Formatamos a resposta para enviar ao frontend apenas os dados que precisamos.
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