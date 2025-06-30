"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Drawer from "../../components/DrawerLateral";

type Genre = {
  id: number;
  name: string;
};

type Movie = {
  id: number;
  title: string;
  poster_path: string;
};

type MovieDetails = Movie & {
  overview: string;
  release_date?: string;
  runtime?: number;
  genres?: Genre[];
  vote_average?: number;
};

export default function InterestsPage() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [interesses, setInteresses] = useState<string[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [filmeSelecionado, setFilmeSelecionado] = useState<MovieDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [mostrarSoInteresses, setMostrarSoInteresses] = useState(false);

  // Buscar filmes populares
  const fetchPopularMovies = async () => {
    setIsModalLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/movies');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDisplayedMovies(data);
    } catch (error) {
      console.error("Erro ao buscar filmes populares:", error);
      setApiError("Não foi possível carregar os filmes.");
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  // Buscar interesses do usuário
  useEffect(() => {
    if (status === "authenticated") {
      const fetchInteresses = async () => {
        try {
          const response = await fetch('/api/interests');
          if (response.ok) {
            const data = await response.json();
            setInteresses(data);
          }
        } catch (error) {
          console.error("Erro ao buscar interesses:", error);
        }
      };
      fetchInteresses();
    }
  }, [status]);

  // Pesquisa de filmes
  const handleSearchSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      fetchPopularMovies();
      return;
    }
    setIsModalLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`/api/movies?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDisplayedMovies(data);
    } catch (error) {
      console.error("Erro ao pesquisar filmes:", error);
      setApiError("A pesquisa falhou.");
    } finally {
      setIsModalLoading(false);
    }
  };

  // Adicionar interesse
  const adicionarInteresse = async (filme: MovieDetails) => {
    if (interesses.includes(filme.title)) return;
    const novosInteresses = [...interesses, filme.title];
    setInteresses(novosInteresses);
    try {
      await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: filme.title, imageUrl: filme.poster_path }),
      });
    } catch (error) {
      console.error("Erro ao adicionar interesse:", error);
      setInteresses(interesses.filter(i => i !== filme.title));
    }
  };

  // Remover interesse
  const removerInteresse = async (titulo: string) => {
    const novosInteresses = interesses.filter((t) => t !== titulo);
    setInteresses(novosInteresses);
    try {
      await fetch('/api/interests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: titulo }),
      });
    } catch (error) {
      console.error("Erro ao remover interesse:", error);
      setInteresses([...novosInteresses, titulo]);
    }
  };

  // Abrir modal com detalhes completos
  const abrirModal = async (filme: Movie) => {
    setModalAberto(true);
    setIsModalLoading(true);
    try {
      const response = await fetch(`/api/movies/details?id=${filme.id}`);
      if (response.ok) {
        const details = await response.json();
        setFilmeSelecionado(details);
      } else {
        setFilmeSelecionado({ ...filme, overview: 'Não foi possível carregar a descrição.' });
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do filme:", error);
      setFilmeSelecionado({ ...filme, overview: 'Erro ao carregar a descrição.' });
    } finally {
      setIsModalLoading(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFilmeSelecionado(null);
  };

  // Filtra filmes para mostrar só os interesses, se ativo
  const filmesFiltrados = mostrarSoInteresses
    ? displayedMovies.filter((f) => interesses.includes(f.title))
    : displayedMovies;

  if (status === "loading") {
    return <div className="min-h-screen bg-[#0e0e13] flex items-center justify-center text-white">A carregar sessão...</div>;
  }

  if (status !== "authenticated") {
    return <div className="min-h-screen bg-[#0e0e13] flex items-center justify-center text-white">Acesso negado. Faça login para continuar.</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-[#0e0e13] text-[#7471D9] font-sans overflow-x-hidden relative">
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} userName={session?.user?.name || ''} />

        {!isOpen && (
          <button onClick={() => setIsOpen(true)} aria-label="Abrir menu" className="fixed top-10 left-10 z-50 bg-[#2f2a51] p-3 rounded-2xl shadow-lg border border-[#7471D9] hover:scale-105 transition-transform duration-200">
            <img src="/sino.png" alt="Abrir menu" className="w-8 h-8" />
          </button>
        )}

        <div className={`transition-all duration-300 p-6 ${isOpen ? "ml-[280px]" : "ml-0"}`}>
          <div className="bg-[#1F1F26] rounded-[36px] max-w-[1850px] mx-auto p-8 relative shadow-lg">
            <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-[#A8A4F8]">
              Let’s build your <span className="text-[#A8A4F8]">YouVerse</span>
            </h1>
            <p className="text-center text-lg md:text-xl mb-6 text-[#A8A4F8]">
              Choose the films that interest you the most
            </p>

            <form onSubmit={handleSearchSubmit} className="flex flex-col items-center gap-4 max-w-5xl mx-auto mb-4">
              <div className="flex items-center border-2 border-[#7471D9] rounded-xl px-4 py-2 w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Pesquisar filmes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-[#7471D9] placeholder:text-[#7471D9]/60"
                />
                <button type="submit">
                  <img
                    src="/lupa.png"
                    alt="Buscar"
                    className="w-6 h-6 filter invert sepia-[0.4] saturate-[7.5] hue-rotate-[210deg] brightness-[0.95] contrast-[0.92] cursor-pointer"
                  />
                </button>
              </div>
              <label className="inline-flex items-center space-x-2 text-[#A8A4F8] text-sm md:text-base cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarSoInteresses}
                  onChange={() => setMostrarSoInteresses(!mostrarSoInteresses)}
                  className="form-checkbox h-5 w-5 text-[#7471D9] rounded bg-transparent border-[#7471D9]"
                />
                <span>Mostrar apenas interesses</span>
              </label>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
              {isModalLoading ? (
                <p className="col-span-full text-center text-lg">A carregar filmes...</p>
              ) : apiError ? (
                <p className="col-span-full text-center text-lg text-red-400">{apiError}</p>
              ) : filmesFiltrados.length > 0 ? (
                filmesFiltrados.map((movie) => {
                  const estaNosInteresses = interesses.includes(movie.title);
                  return (
<div
  key={movie.id}
  className="relative group w-full max-w-[216px] aspect-[2/3] rounded-lg overflow-hidden"
>
  <img
    src={movie.poster_path}
    alt={movie.title}
    className="w-full h-full object-cover rounded-lg"
  />

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center space-y-2 text-white text-sm font-semibold transition-opacity duration-300">
                        <button
                          onClick={() => abrirModal(movie)}
                          className="bg-white text-[#1F1F26] px-4 py-2 rounded-full hover:bg-gray-200 transition"
                        >
                          Saber mais
                        </button>
                        {!estaNosInteresses ? (
                          <button
                            onClick={() =>
                              adicionarInteresse({
                                ...movie,
                                overview: "Nenhuma descrição disponível.",
                              })
                            }
                            className="bg-[#7471D9] px-4 py-2 rounded-full hover:bg-[#5c58c9] transition"
                          >
                            Adicionar aos interesses
                          </button>
                        ) : (
                          <button
                            onClick={() => removerInteresse(movie.title)}
                            className="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition"
                          >
                            Remover dos interesses
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-2xl font-semibold text-[#A8A4F8] col-span-full flex items-center justify-center h-40">
                  Nenhum filme encontrado.
                </p>
              )}
            </div>
          </div>
        </div>

{modalAberto && (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={fecharModal}
  >
    <div
      className="bg-[#1F1F26] text-white p-6 rounded-2xl shadow-xl w-[90%] max-w-3xl relative max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {isModalLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : filmeSelecionado ? (
        <div className="flex flex-col sm:flex-row gap-6">
          <img
            src={filmeSelecionado.poster_path}
            alt={filmeSelecionado.title}
            className="w-full max-w-xs rounded-lg object-cover shadow-lg"
          />
          <div className="flex flex-col flex-grow">
            <h2 className="text-3xl font-extrabold mb-4 text-[#A8A4F8] drop-shadow-md">
              {filmeSelecionado.title}
            </h2>

            <div className="text-sm text-gray-300 mb-6 space-y-3">
              {filmeSelecionado.release_date && (
                <p className="flex items-center gap-2 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7471D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Lançamento:{" "}
                  <span className="font-normal ml-1">
                    {new Date(filmeSelecionado.release_date).toLocaleDateString()}
                  </span>
                </p>
              )}

              {filmeSelecionado.runtime && (
                <p className="flex items-center gap-2 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7471D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  </svg>
                  Duração:{" "}
                  <span className="font-normal ml-1">{filmeSelecionado.runtime} min</span>
                </p>
              )}

              {filmeSelecionado.genres && filmeSelecionado.genres.length > 0 && (
                <p className="flex items-center gap-2 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7471D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Gêneros:{" "}
                  <span className="font-normal ml-1">
                    {filmeSelecionado.genres.map((g) => g.name).join(", ")}
                  </span>
                </p>
              )}

              {typeof filmeSelecionado.vote_average === "number" && (
                <p className="flex items-center gap-2 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.971c.3.922-.755 1.688-1.538 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.783.57-1.838-.196-1.538-1.118l1.287-3.971a1 1 0 00-.364-1.118L2.045 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
                  </svg>
                  Avaliação:{" "}
                  <span className="font-normal ml-1">{filmeSelecionado.vote_average.toFixed(1)} / 10</span>
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
              <p>{filmeSelecionado.overview || "Nenhuma descrição disponível."}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-auto">
              <button
                onClick={fecharModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-full transition"
              >
                Fechar
              </button>
              {!interesses.includes(filmeSelecionado.title) ? (
                <button
                  onClick={() => {
                    adicionarInteresse(filmeSelecionado);
                    fecharModal();
                  }}
                  className="bg-[#7471D9] hover:bg-[#5c58c9] px-5 py-2 rounded-full transition"
                >
                  Adicionar aos interesses
                </button>
              ) : (
                <button
                  onClick={() => {
                    removerInteresse(filmeSelecionado.title);
                    fecharModal();
                  }}
                  className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-full transition"
                >
                  Remover dos interesses
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </div>
)}

      </div>

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
    </>
  );
}
