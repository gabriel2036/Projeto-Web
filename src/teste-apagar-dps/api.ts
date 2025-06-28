import axios from "axios";

const API_KEY = "99f1966dd7e435eb4ee5abefc8673d8b";
const BASE_URL = "https://api.themoviedb.org/3";

export async function buscarFilmePorNome(titulo: string) {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: API_KEY,
      language: "pt-BR",
      query: titulo,
      include_adult: false
    }
  });

  const resultados = response.data.results;

  if (!resultados || resultados.length === 0) {
    return null; // Nenhum filme encontrado
  }

  const filme = resultados[0]; // Pega o primeiro resultado

  return {
    id: filme.id,
    title: filme.title,
    year: filme.release_date?.split("-")[0],
    poster: `https://image.tmdb.org/t/p/w500${filme.poster_path}`
  };
}


