"use client";

import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true); // Começa aberto, como na imagem

  return (
    <div className="min-h-screen bg-[#0e0e13] text-[#7471D9] font-sans overflow-x-hidden relative">
      {/* Drawer lateral fixo */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-[#2f2a51] p-6 flex flex-col justify-between z-50 rounded-r-3xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Topo com logo e botão de fechar */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/sino.png" alt="Logo" className="w-6 h-6" />
              <h1 className="text-xl font-bold text-[#A8A4F8]">YouVerse</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white text-xl">
              ❌
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex flex-col space-y-4 text-[#A8A4F8]">
            <button className="flex items-center space-x-2 text-left hover:text-white transition">
              <span>💜</span>
              <span>Match</span>
            </button>

            <button className="flex items-center space-x-2 bg-[#1F1F26] text-white px-4 py-2 rounded-full font-semibold shadow">
              <span>⭐</span>
              <span>Interests</span>
            </button>
          </nav>
        </div>

        {/* Rodapé */}
        <div className="space-y-4 text-[#A8A4F8]">
          <button className="flex items-center space-x-2 hover:text-white transition">
            <span>↩️</span>
            <span>Logout</span>
          </button>

          <div className="flex items-center space-x-2 bg-[#1F1F26] px-4 py-2 rounded-full">
            <span>🟣</span>
            <span>Your Name</span>
          </div>
        </div>
      </div>

      {/* Botão do sino fixo para abrir o menu */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menu"
          className="fixed top-10 left-10 z-50 bg-[#2f2a51] p-3 rounded-2xl shadow-lg border border-[#7471D9] hover:scale-105 transition-transform duration-200"
        >
          <img src="/sino.png" alt="Abrir menu" className="w-8 h-8" />
        </button>
      )}

      {/* Conteúdo principal com deslocamento quando menu está aberto */}
      <div
        className={`transition-all duration-300 p-6 ${
          isOpen ? "ml-[280px]" : "ml-0"
        }`}
      >
        <div className="bg-[#1F1F26] rounded-[36px] max-w-[1850px] mx-auto p-8 relative shadow-lg">
          <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-[#A8A4F8]">
            Let’s build your <span className="text-[#A8A4F8]">YouVerse</span>
          </h1>

          <p className="text-center text-lg md:text-xl mb-6 text-[#A8A4F8]">
            Choose the films that interest you the most
          </p>

          <div className="flex items-center border-2 border-[#7471D9] rounded-xl px-4 py-2 max-w-xl mx-auto mb-8">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
            {[
              { src: "/placeholder/Orgulho.jpg", alt: "Pride & Prejudice 2005" },
              { src: "/placeholder/odeio.jpg", alt: "10 Things I Hate About You" },
              { src: "/placeholder/Brid.jpg", alt: "Bridgertown" },
              { src: "/placeholder/Orgulho.jpg", alt: "Pride & Prejudice 2005" },
              { src: "/placeholder/odeio.jpg", alt: "10 Things I Hate About You" },
              { src: "/placeholder/Brid.jpg", alt: "Bridgertown" },

            ].map((movie, i) => (
              <img
                key={i}
                src={movie.src}
                alt={movie.alt}
                className="w-full max-w-[216px] h-[28vw] min-h-[120px] max-h-[300px] rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}