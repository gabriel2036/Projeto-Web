"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Heart, Star, LogOut, User, X, Check, Search } from "lucide-react";

// Tipos para os dados que virão da API
type PendingRequest = {
  requester: {
    id: number;
    name: string;
  };
};

type SearchedUser = {
  id: number;
  name: string;
  email: string;
};

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Estados para os dados reais
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pesquisaModal, setPesquisaModal] = useState("");
  const [statusMessage, setStatusMessage] = useState(""); // Para feedback ao utilizador

  // Efeito para buscar os pedidos de amizade quando o drawer abre
  useEffect(() => {
    if (isOpen) {
      const fetchRequests = async () => {
        try {
            const response = await fetch('/api/friends?type=requests');
            if (response.ok) {
              const data = await response.json();
              setPendingRequests(data);
            }
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        }
      };
      fetchRequests();
    }
  }, [isOpen]);

  // Efeito para procurar utilizadores quando o texto da pesquisa muda
  useEffect(() => {
    // Procura apenas após 2 caracteres para não sobrecarregar
    if (pesquisaModal.trim().length > 2) { 
      const searchUsers = async () => {
        try {
            const response = await fetch(`/api/friends?query=${pesquisaModal}`);
            if (response.ok) {
              const data = await response.json();
              setSearchedUsers(data);
            }
        } catch(error) {
            console.error("Erro ao procurar utilizadores:", error)
        }
      };
      // Debounce para evitar uma chamada à API a cada tecla pressionada
      const timer = setTimeout(() => searchUsers(), 500); 
      return () => clearTimeout(timer);
    } else {
      setSearchedUsers([]);
    }
  }, [pesquisaModal]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };
  
  const handleSendRequest = async (addresseeId: number) => {
    setStatusMessage("A enviar pedido...");
    try {
        const response = await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresseeId }),
        });
        if(response.ok) {
            setStatusMessage("Pedido enviado com sucesso!");
        } else {
            const errorData = await response.json();
            setStatusMessage(errorData.error || "Falha ao enviar pedido.");
        }
    } catch(error) {
        setStatusMessage("Erro de rede.");
    }
    setTimeout(() => setStatusMessage(""), 3000); // Limpa a mensagem após 3 segundos
  };

  const handleRespondRequest = async (requesterId: number, status: 'ACCEPTED' | 'DECLINED') => {
      try {
          await fetch('/api/friends', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requesterId, status }),
          });
          // Remove o pedido da lista da UI após responder
          setPendingRequests(pendingRequests.filter(req => req.requester.id !== requesterId));
      } catch (error) {
          console.error("Erro ao responder ao pedido:", error)
      }
  };


  return (
    <>
      {/* Drawer lateral */}
      <div
        className={`fixed top-6 left-0 h-[calc(100vh-48px)] max-h-[700px] w-[290px] bg-gradient-to-b from-[#2f2a51] to-[#1f1f3d] p-6 flex flex-col justify-between z-50 rounded-r-3xl shadow-2xl transition-transform duration-300 ${
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
              <X size={24} />
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex flex-col gap-3 text-[#C9C6FF] text-sm font-medium">
            <button onClick={() => router.push('/match')} className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-[#413c72] hover:text-white transition">
              <Heart className="w-5 h-5" />
              <span>Match</span>
            </button>
            <button onClick={() => router.push('/interests')} className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-[#413c72] hover:text-white transition">
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

        {/* Convites de amizade com dados reais */}
        <div className="border-t border-[#4a447a] pt-4 flex flex-col">
          <h2 className="text-sm font-semibold text-[#C9C6FF] mb-2">
            Convites de amizade
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-48 pr-1 custom-scrollbar">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div key={request.requester.id} className="flex items-center justify-between bg-[#413c72] px-3 py-2 rounded-xl text-white shadow mr-2.5">
                  <span className="text-sm font-medium">{request.requester.name}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRespondRequest(request.requester.id, 'ACCEPTED')} className="bg-green-500 p-1 rounded-full hover:bg-green-600 transition" title="Aceitar">
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => handleRespondRequest(request.requester.id, 'DECLINED')} className="bg-red-500 p-1 rounded-full hover:bg-red-600 transition" title="Recusar">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-center text-gray-300 italic">Nenhum convite pendente.</span>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col items-center gap-4 text-[#C9C6FF] pt-4">
          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-white hover:underline transition text-sm">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          <div className="flex items-center gap-2 bg-[#413c72] px-4 py-2 rounded-full shadow-inner">
            <User className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">{session?.user?.name || 'Utilizador'}</span>
          </div>
        </div>
      </div>
      
      {/* ... Botão do sino (o seu código aqui) ... */}

      {/* Modal Procurar Amigo com dados reais */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setModalAberto(false)}>
          <div className="bg-[#2f2a51] w-full max-w-md p-6 rounded-xl shadow-2xl border border-[#7471D9]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-bold">Procurar amigo</h2>
              <button onClick={() => setModalAberto(false)} className="text-white text-xl hover:text-red-400">
                <X size={24}/>
              </button>
            </div>
            <input type="text" placeholder="Digite o nome do utilizador..." value={pesquisaModal} onChange={(e) => setPesquisaModal(e.target.value)} className="w-full bg-[#1f1f3d] text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#7471D9] placeholder:text-[#aaa]" />
            {statusMessage && <p className="text-green-400 text-center text-sm my-2">{statusMessage}</p>}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {searchedUsers.length > 0 ? (
                searchedUsers.map((user) => (
                  <div key={user.id} className="bg-[#413c72] text-white px-4 py-2 rounded-lg flex justify-between items-center">
                    <span>{user.name}</span>
                    <button onClick={() => handleSendRequest(user.id)} className="text-sm text-[#C9C6FF] hover:text-white underline">
                      Adicionar
                    </button>
                  </div>
                ))
              ) : (
                pesquisaModal.length > 2 && <span className="text-sm text-gray-300 italic text-center">Nenhum utilizador encontrado.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
