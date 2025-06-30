'use client';

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  year: number;
  poster: string;
  overview: string;
  originalId?: number;
}

interface MovieDetails extends Movie {
  release_date?: string;
  runtime?: number;
  genres?: Genre[];
  vote_average?: number;
  poster_path?: string;
}

export default function MovieInfoModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setIsLoading(true);
      fetchMovieDetails(movie);
    }
  }, [movie]);

  const fetchMovieDetails = async (basicMovie: Movie) => {
    try {
      const response = await fetch(`/api/movies/details?id=${basicMovie.id}`);
      if (response.ok) {
        const details = await response.json();
        setMovieDetails(details);
      } else {
        // Fallback para informações básicas se a API falhar
        setMovieDetails({
          ...basicMovie,
          poster_path: basicMovie.poster,
          overview: basicMovie.overview || 'Não foi possível carregar a descrição.'
        });
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do filme:", error);
      setMovieDetails({
        ...basicMovie,
        poster_path: basicMovie.poster,
        overview: 'Erro ao carregar a descrição.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!movie) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="bg-[#1F1F26] text-white p-6 rounded-2xl shadow-xl w-[90%] max-w-3xl relative max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-all flex items-center justify-center"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : movieDetails ? (
            <div className="flex flex-col sm:flex-row gap-6">
              <img
                src={movieDetails.poster_path || movieDetails.poster}
                alt={`Pôster do filme ${movieDetails.title}`}
                className="w-full max-w-xs rounded-lg object-cover shadow-lg"
              />
              
              <div className="flex flex-col flex-grow">
                <h2 className="text-3xl font-extrabold mb-4 text-[#A8A4F8] drop-shadow-md">
                  {movieDetails.title}
                </h2>

                <div className="text-sm text-gray-300 mb-6 space-y-3">
                  {movieDetails.release_date && (
                    <p className="flex items-center gap-2 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7471D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Lançamento:{" "}
                      <span className="font-normal ml-1">
                        {new Date(movieDetails.release_date).toLocaleDateString()}
                      </span>
                    </p>
                  )}

                  {movieDetails.runtime && (
                    <p className="flex items-center gap-2 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7471D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                      </svg>
                      Duração:{" "}
                      <span className="font-normal ml-1">{movieDetails.runtime} min</span>
                    </p>
                  )}

                  {movieDetails.genres && movieDetails.genres.length > 0 && (
                    <p className="flex items-center gap-2 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7471D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Gêneros:{" "}
                      <span className="font-normal ml-1">
                        {movieDetails.genres.map((g) => g.name).join(", ")}
                      </span>
                    </p>
                  )}

                  {typeof movieDetails.vote_average === "number" && (
                    <p className="flex items-center gap-2 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.971c.3.922-.755 1.688-1.538 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.783.57-1.838-.196-1.538-1.118l1.287-3.971a1 1 0 00-.364-1.118L2.045 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
                      </svg>
                      Avaliação:{" "}
                      <span className="font-normal ml-1">{movieDetails.vote_average.toFixed(1)} / 10</span>
                    </p>
                  )}
                </div>

                <div className="mb-6 max-h-44 overflow-y-auto custom-scrollbar border border-[#7471D9] rounded-lg p-4 bg-[#2f2a51]/20 text-gray-300 leading-relaxed">
                  <h3 className="text-lg font-semibold mb-2 text-[#A8A4F8] flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#7471D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V7a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2v11a2 2 0 01-2 2z" />
                    </svg>
                    Sinopse
                  </h3>
                  <p>{movieDetails.overview || "Nenhuma descrição disponível."}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-auto">
                  <button
                    onClick={onClose}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-full transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #1F1F26;
              border-radius: 12px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #7471D9;
              border-radius: 12px;
              border: 2px solid #1F1F26;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #A8A4F8;
            }
            /* Firefox */
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #7471D9 #1F1F26;
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
