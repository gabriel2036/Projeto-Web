"use client";

import { useEffect, useState } from "react";
import Drawer from "../../components/DrawerLateral";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const [interesses, setInteresses] = useState<string[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [filmeSelecionado, setFilmeSelecionado] = useState<{ src: string; alt: string } | null>(null);
  const [mostrarSoInteresses, setMostrarSoInteresses] = useState(false);

  const filmes = [
    { src: "/placeholder/Orgulho.jpg", alt: "Pride & Prejudice 2005" },
    { src: "/placeholder/odeio.jpg", alt: "10 Things I Hate About You" },
    { src: "/placeholder/Brid.jpg", alt: "Bridgertown" },
    { src: "/placeholder/Orgulho.jpg", alt: "Pride & Prejudice 2005" },
    { src: "/placeholder/odeio.jpg", alt: "10 Things I Hate About You" },
    { src: "/placeholder/Brid.jpg", alt: "Bridgertown" },
  ];

  useEffect(() => {
    const armazenado = localStorage.getItem("interesses");
    if (armazenado) {
      setInteresses(JSON.parse(armazenado));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("interesses", JSON.stringify(interesses));
  }, [interesses]);

  const adicionarInteresse = (titulo: string) => {
    if (!interesses.includes(titulo)) {
      setInteresses([...interesses, titulo]);
    }
  };

  const removerInteresse = (titulo: string) => {
    setInteresses(interesses.filter((t) => t !== titulo));
  };

  const abrirModal = (filme: { src: string; alt: string }) => {
    setFilmeSelecionado(filme);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFilmeSelecionado(null);
  };

  const filmesExibidos = mostrarSoInteresses
    ? filmes.filter((f) => interesses.includes(f.alt))
    : filmes;

  return (
    <div className="min-h-screen bg-[#0e0e13] text-[#7471D9] font-sans overflow-x-hidden relative">
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

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
            <div className="flex items-center border-2 border-[#7471D9] rounded-xl px-4 py-2 w-150">
              <input
                type="text"
                placeholder="Search in your friend list..."
                className="bg-transparent flex-1 outline-none text-[#7471D9] placeholder:text-[#7471D9]/60"
              />
              <img
                src="/lupa.png"
                alt="Buscar"
                className="w-6 md:w-8 filter invert sepia-[0.4] saturate-[7.5] hue-rotate-[210deg] brightness-[0.95] contrast-[0.92]"
              />
            </div>

            <label className="inline-flex items-center space-x-2 text-[#A8A4F8] text-sm md:text-base cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarSoInteresses}
                onChange={() => setMostrarSoInteresses(!mostrarSoInteresses)}
                className="form-checkbox h-5 w-5 text-[#7471D9] rounded"
              />
              <span>Mostrar apenas interesses</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
            {filmesExibidos.length > 0 ? (
              filmesExibidos.map((movie, i) => {
                const estaNosInteresses = interesses.includes(movie.alt);
                return (
                  <div
                    key={i}
                    className="relative group w-full max-w-[216px] h-[28vw] min-h-[120px] max-h-[300px] rounded-lg overflow-hidden"
                  >
                    <img
                      src={movie.src}
                      alt={movie.alt}
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
                          onClick={() => adicionarInteresse(movie.alt)}
                          className="bg-[#7471D9] px-4 py-2 rounded-full hover:bg-[#5c58c9] transition"
                        >
                          Adicionar aos interesses
                        </button>
                      ) : (
                        <button
                          onClick={() => removerInteresse(movie.alt)}
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
                Nenhum filme para mostrar.
              </p>
            )}
          </div>
        </div>
      </div>

      {modalAberto && filmeSelecionado && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={fecharModal}
        >
          <div
            className="bg-[#1F1F26] text-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">{filmeSelecionado.alt}</h2>
            <p className="text-sm text-[#A8A4F8] mb-6">
              Em breve: mais detalhes sobre este filme usando uma API externa!
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={fecharModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full"
              >
                Fechar
              </button>
              {!interesses.includes(filmeSelecionado.alt) ? (
                <button
                  onClick={() => {
                    adicionarInteresse(filmeSelecionado.alt);
                    fecharModal();
                  }}
                  className="bg-[#7471D9] hover:bg-[#5c58c9] px-4 py-2 rounded-full"
                >
                  Adicionar aos interesses
                </button>
              ) : (
                <button
                  onClick={() => {
                    removerInteresse(filmeSelecionado.alt);
                    fecharModal();
                  }}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full"
                >
                  Remover dos interesses
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
