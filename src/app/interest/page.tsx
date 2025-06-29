"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Drawer from "../../components/DrawerLateral";

type Movie = {
  id: number;
  title: string;
  poster_path: string;
};

type MovieDetails = Movie & {
  overview: string;
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

  const adicionarInteresse = async (filme: Movie) => {
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
      setInteresses(interesses.filter(i => i !== filme.title)); // Reverte em caso de erro
    }
  };

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
      setInteresses([...novosInteresses, titulo]); // Reverte em caso de erro
    }
  };

  const abrirModal = async (filme: Movie) => {
    setModalAberto(true);
    setIsModalLoading(true);
    try {
        const response = await fetch(`/api/movies?id=${filme.id}`);
        if(response.ok) {
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
              <input type="text" placeholder="Pesquisar filmes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent flex-1 outline-none text-[#7471D9] placeholder:text-[#7471D9]/60" />
              <button type="submit">
                <img src="/lupa.png" alt="Buscar" className="w-6 h-6 filter invert sepia-[0.4] saturate-[7.5] hue-rotate-[210deg] brightness-[0.95] contrast-[0.92] cursor-pointer" />
              </button>
            </div>
            <label className="inline-flex items-center space-x-2 text-[#A8A4F8] text-sm md:text-base cursor-pointer">
              <input type="checkbox" checked={mostrarSoInteresses} onChange={() => setMostrarSoInteresses(!mostrarSoInteresses)} className="form-checkbox h-5 w-5 text-[#7471D9] rounded bg-transparent border-[#7471D9]" />
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
                  <div key={movie.id} className="relative group w-full max-w-[216px] h-[28vw] min-h-[120px] max-h-[300px] rounded-lg overflow-hidden">
                    <img src={movie.poster_path} alt={movie.title} className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center space-y-2 text-white text-sm font-semibold transition-opacity duration-300">
                      <button onClick={() => abrirModal(movie)} className="bg-white text-[#1F1F26] px-4 py-2 rounded-full hover:bg-gray-200 transition">
                        Saber mais
                      </button>
                      {!estaNosInteresses ? (
                        <button onClick={() => adicionarInteresse(movie)} className="bg-[#7471D9] px-4 py-2 rounded-full hover:bg-[#5c58c9] transition">
                          Adicionar aos interesses
                        </button>
                      ) : (
                        <button onClick={() => removerInteresse(movie.title)} className="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition">
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
            className="bg-[#1F1F26] text-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {isModalLoading ? (
                <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            ) : filmeSelecionado && (
              <>
                <h2 className="text-2xl font-bold mb-4">{filmeSelecionado.title}</h2>
                <p className="text-sm text-gray-300 mb-6 max-h-40 overflow-y-auto custom-scrollbar">
                  {filmeSelecionado.overview || "Nenhuma descrição disponível."}
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    onClick={fecharModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full"
                  >
                    Fechar
                  </button>
                  {!interesses.includes(filmeSelecionado.title) ? (
                    <button
                      onClick={() => {
                        adicionarInteresse(filmeSelecionado);
                        fecharModal();
                      }}
                      className="bg-[#7471D9] hover:bg-[#5c58c9] px-4 py-2 rounded-full"
                    >
                      Adicionar aos interesses
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        removerInteresse(filmeSelecionado.title);
                        fecharModal();
                      }}
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full"
                    >
                      Remover dos interesses
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
