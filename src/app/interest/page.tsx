"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Drawer from "../../components/DrawerLateral"; // Verifique se este caminho está correto

// Define o tipo para um objeto de filme
type Movie = {
  src: string;
  alt: string;
};

export default function InterestsPage() {
  const { data: session, status } = useSession(); // Hook para obter a sessão do utilizador
  const [isOpen, setIsOpen] = useState(false);
  const [interesses, setInteresses] = useState<string[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [filmeSelecionado, setFilmeSelecionado] = useState<Movie | null>(null);
  const [mostrarSoInteresses, setMostrarSoInteresses] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Estado para a barra de pesquisa

  // Dados de exemplo - idealmente, isto virá de uma chamada à API do TMDb
  const filmes: Movie[] = [
    { src: "/placeholder/Orgulho.jpg", alt: "Pride & Prejudice 2005" },
    { src: "/placeholder/odeio.jpg", alt: "10 Things I Hate About You" },
    { src: "/placeholder/Brid.jpg", alt: "Bridgerton" },
    { src: "/placeholder/Filme4.jpg", alt: "Filme Exemplo 4" },
    { src: "/placeholder/Filme5.jpg", alt: "Filme Exemplo 5" },
    { src: "/placeholder/Filme6.jpg", alt: "Filme Exemplo 6" },
  ];

  // Efeito para buscar os interesses do utilizador autenticado
  useEffect(() => {
    if (status === "authenticated") {
      const fetchInteresses = async () => {
        try {
          const response = await fetch('/api/interests');
          if (response.ok) {
            const data = await response.json();
            setInteresses(data);
          } else {
            console.error("Falha ao buscar interesses:", await response.text());
          }
        } catch (error) {
          console.error("Erro de rede ao buscar interesses:", error);
        }
      };
      fetchInteresses();
    }
  }, [status]);

  // Função para adicionar um interesse
  const adicionarInteresse = async (filme: Movie) => {
    if (interesses.includes(filme.alt)) return; // Não faz nada se já existir

    const novosInteresses = [...interesses, filme.alt];
    setInteresses(novosInteresses); // Atualização otimista da UI

    try {
      await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: filme.alt, imageUrl: filme.src }),
      });
    } catch (error) {
      console.error("Erro ao adicionar interesse:", error);
      setInteresses(interesses); // Reverte a UI em caso de erro
    }
  };

  // Função para remover um interesse
  const removerInteresse = async (titulo: string) => {
    const novosInteresses = interesses.filter((t) => t !== titulo);
    setInteresses(novosInteresses); // Atualização otimista

    try {
      await fetch('/api/interests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: titulo }),
      });
    } catch (error) {
      console.error("Erro ao remover interesse:", error);
      setInteresses(interesses); // Reverte a UI
    }
  };

  const abrirModal = (filme: Movie) => {
    setFilmeSelecionado(filme);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFilmeSelecionado(null);
  };
  
  // Filtra os filmes com base na pesquisa E na checkbox de interesses
  const filmesFiltrados = filmes
    .filter((f) => f.alt.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((f) => (mostrarSoInteresses ? interesses.includes(f.alt) : true));


  if (status === "loading") {
    return <div className="min-h-screen bg-[#0e0e13] flex items-center justify-center text-white">Carregando...</div>;
  }
  
  if (status !== "authenticated") {
    return <div className="min-h-screen bg-[#0e0e13] flex items-center justify-center text-white">Acesso negado. Faça login para continuar.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0e0e13] text-[#7471D9] font-sans overflow-x-hidden relative">
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} userName={session.user?.name || ''} />

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menu"
          className="fixed top-10 left-10 z-50 bg-[#2f2a51] p-3 rounded-2xl shadow-lg border border-[#7471D9] hover:scale-105 transition-transform duration-200"
        >
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

          <div className="flex flex-col items-center gap-4 max-w-5xl mx-auto mb-4">
            <div className="flex items-center border-2 border-[#7471D9] rounded-xl px-4 py-2 w-full md:w-1/2">
              <input
                type="text"
                placeholder="Pesquisar filmes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 outline-none text-[#7471D9] placeholder:text-[#7471D9]/60"
              />
              <img src="/lupa.png" alt="Buscar" className="w-6 h-6 filter invert sepia-[0.4] saturate-[7.5] hue-rotate-[210deg] brightness-[0.95] contrast-[0.92]" />
            </div>

            <label className="inline-flex items-center space-x-2 text-[#A8A4F8] text-sm md:text-base cursor-pointer">
              <input type="checkbox" checked={mostrarSoInteresses} onChange={() => setMostrarSoInteresses(!mostrarSoInteresses)} className="form-checkbox h-5 w-5 text-[#7471D9] rounded" />
              <span>Mostrar apenas interesses</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
            {filmesFiltrados.length > 0 ? (
              filmesFiltrados.map((movie, i) => {
                const estaNosInteresses = interesses.includes(movie.alt);
                return (
                  <div key={`${movie.alt}-${i}`} className="relative group w-full max-w-[216px] h-[28vw] min-h-[120px] max-h-[300px] rounded-lg overflow-hidden">
                    <img src={movie.src} alt={movie.alt} className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center space-y-2 text-white text-sm font-semibold transition-opacity duration-300">
                      <button onClick={() => abrirModal(movie)} className="bg-white text-[#1F1F26] px-4 py-2 rounded-full hover:bg-gray-200 transition">
                        Saber mais
                      </button>
                      {!estaNosInteresses ? (
                        <button onClick={() => adicionarInteresse(movie)} className="bg-[#7471D9] px-4 py-2 rounded-full hover:bg-[#5c58c9] transition">
                          Adicionar aos interesses
                        </button>
                      ) : (
                        <button onClick={() => removerInteresse(movie.alt)} className="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition">
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
      
      {/* O código do Modal continua aqui, sem alterações na sua lógica */}
      {modalAberto && filmeSelecionado && (
        <div onClick={fecharModal} className="fixed inset-0 ...">
            {/* ... */}
        </div>
      )}
    </div>
  );
}
