"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Star,
  LogOut,
  User,
  X,
  Check,
  Search,
} from "lucide-react";

const fakeUsuarios = [
  { id: 1, nome: "Ana Carolina" },
  { id: 2, nome: "Gabriel Benez" },
  { id: 3, nome: "Lucas Lana" },
  { id: 4, nome: "Bruna Lima" },
  { id: 5, nome: "João Silva" },
];

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
};

export default function Drawer({ isOpen, onClose, userName = "Usuário #0001" }: DrawerProps) {
  const router = useRouter();
  const [pesquisa, setPesquisa] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [pesquisaModal, setPesquisaModal] = useState("");

  const convitesFiltrados = useMemo(() => {
    return fakeUsuarios.slice(0, 3).filter((convite) =>
      convite.nome.toLowerCase().includes(pesquisa.toLowerCase())
    );
  }, [pesquisa]);

  const usuariosFiltrados = useMemo(() => {
    return fakeUsuarios.filter((usuario) =>
      usuario.nome.toLowerCase().includes(pesquisaModal.toLowerCase())
    );
  }, [pesquisaModal]);

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <>
      {/* Drawer lateral */}
      <div
        className={`fixed top-6 left-0 h-164 w-[290px] bg-gradient-to-b from-[#2f2a51] to-[#1f1f3d] p-6 flex flex-col justify-between z-50 rounded-r-3xl shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/sino.png" alt="Logo" className="w-7 h-7" />
              <h1 className="text-2xl font-bold text-[#C9C6FF] tracking-wide">
                YouVerse
              </h1>
            </div>
            <button
              onClick={onClose}
              className="text-white text-lg hover:text-red-400 transition"
              aria-label="Fechar menu"
            >
              ❌
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex flex-col gap-3 text-[#C9C6FF] text-sm font-medium">
            <button className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-[#413c72] hover:text-white transition">
              <Heart className="w-5 h-5" />
              <span>Match</span>
            </button>
            <button className="flex items-center gap-3 py-2 px-4 rounded-xl bg-[#413c72] text-white shadow-lg font-semibold">
              <Star className="w-5 h-5" />
              <span>Interests</span>
            </button>
            <button
              className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-[#413c72] hover:text-white transition"
              onClick={() => setModalAberto(true)}
            >
              <Search className="w-5 h-5" />
              <span>Procurar amigo</span>
            </button>
          </nav>
        </div>

        {/* Convites */}
        <div className="-mt-30 border-t border-[#4a447a] pt-4 relative flex flex-col">
          <h2 className="text-sm font-semibold text-[#C9C6FF] mb-2">
            Convites de amizade
          </h2>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-48 pr-1 custom-scrollbar">
            {convitesFiltrados.length > 0 ? (
              convitesFiltrados.map((convite) => (
                <div
                  key={convite.id}
                  className="flex items-center justify-between bg-[#413c72] px-3 py-2 rounded-xl text-white shadow mr-2.5"
                >
                  <span className="text-sm font-medium">{convite.nome}</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-green-500 p-1 rounded-full hover:bg-green-600 transition"
                      title="Aceitar"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button
                      className="bg-red-500 p-1 rounded-full hover:bg-red-600 transition"
                      title="Recusar"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-center text-gray-300 italic">
                Nenhum convite encontrado.
              </span>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col items-center gap-4 text-[#C9C6FF] pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-white hover:underline transition text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          <div className="flex items-center gap-2 bg-[#413c72] px-4 py-2 rounded-full shadow-inner">
            <User className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">{userName}</span>
          </div>
        </div>
      </div>

      {/* Botão do sino */}
      {!isOpen && (
        <button
          onClick={onClose}
          aria-label="Abrir menu"
          className="fixed top-10 left-10 z-50 bg-[#2f2a51] p-3 rounded-2xl shadow-xl border border-[#7471D9] hover:scale-105 hover:shadow-purple-600 transition-transform duration-200"
        >
          <img src="/sino.png" alt="Abrir menu" className="w-7 h-7" />
        </button>
      )}

      {/* Modal Procurar Amigo */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setModalAberto(false)} // Clica fora = fecha
        >
          <div
            className="bg-[#2f2a51] w-full max-w-md p-6 rounded-xl shadow-2xl border border-[#7471D9]"
            onClick={(e) => e.stopPropagation()} // Impede fechamento ao clicar dentro
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-bold">Procurar amigo</h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-white text-xl hover:text-red-400"
              >
                ❌
              </button>
            </div>
            <input
              type="text"
              placeholder="Digite o nome do usuário..."
              value={pesquisaModal}
              onChange={(e) => setPesquisaModal(e.target.value)}
              className="w-full bg-[#1f1f3d] text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#7471D9] placeholder:text-[#aaa]"
            />
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="bg-[#413c72] text-white px-4 py-2 rounded-lg flex justify-between items-center"
                  >
                    <span>{usuario.nome}</span>
                    <button className="text-sm text-[#C9C6FF] hover:text-white underline">
                      Adicionar
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-300 italic text-center">
                  Nenhum usuário encontrado.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
