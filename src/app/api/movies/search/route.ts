// ARQUIVO: src/app/api/movies/search/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!API_KEY) {
    return NextResponse.json({ error: 'Chave da API da TMDB não configurada' }, { status: 500 });
  }
  if (!query) {
    return NextResponse.json({ error: 'O parâmetro "query" é obrigatório' }, { status: 400 });
  }

  try {
    const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        language: "pt-BR",
        query: query,
        include_adult: false,
      },
    });

    if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
      return NextResponse.json({ error: 'Nenhum filme encontrado' }, { status: 404 });
    }

    const filme = searchResponse.data.results[0];

 
    const dadosDoFilme = {
      id: filme.id,
      title: filme.title,
      year: filme.release_date?.split("-")[0] || 'N/A',
      poster: `https://image.tmdb.org/t/p/w500${filme.poster_path}`,
      overview: filme.overview || 'Sinopse não disponível.', 
    };

    return NextResponse.json(dadosDoFilme);

  } catch (error) {
    console.error("Erro na API da TMDB:", error);
    return NextResponse.json({ error: 'Falha ao buscar dados do filme' }, { status: 500 });
  }
}