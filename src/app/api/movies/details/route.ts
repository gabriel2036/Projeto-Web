import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('id');

  if (!API_KEY) {
    return NextResponse.json({ error: 'Chave da API da TMDB não configurada' }, { status: 500 });
  }
  if (!movieId) {
    return NextResponse.json({ error: 'O parâmetro "id" é obrigatório' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: API_KEY,
        language: 'pt-BR',
      },
    });

    const data = response.data;

    // Mapeia os dados importantes
    const detalhes = {
      id: data.id,
      title: data.title,
      overview: data.overview || 'Sinopse não disponível.',
      release_date: data.release_date,
      runtime: data.runtime, // em minutos
      genres: data.genres, // array de objetos { id, name }
      vote_average: data.vote_average, // nota média
      poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
    };

    return NextResponse.json(detalhes);

  } catch (error) {
    console.error("Erro ao buscar detalhes do filme na TMDB:", error);
    return NextResponse.json({ error: 'Falha ao buscar detalhes do filme' }, { status: 500 });
  }
}
