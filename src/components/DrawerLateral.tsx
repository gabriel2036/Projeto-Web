"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Heart, Star, LogOut, User, X, Check, Search } from "lucide-react";

// Tipos para os dados que virão da API
type PendingRequest = {
  requester: { id: number; name: string; };
};
type Friend = {
  id: number;
  name: string;
};
type SearchedUser = {
  id: number;
  name: string;
  email: string;
};

// CORREÇÃO AQUI: Adicionamos a prop 'userName' de volta
type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  userName?: string; // Propriedade para receber o nome do utilizador
};

export default function Drawer({ isOpen, onClose, userName }: DrawerProps) {
  // O componente agora não precisa do seu próprio useSession, pois recebe o nome por prop.
  const router = useRouter();

  // Estados para os dados reais
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pesquisaModal, setPesquisaModal] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Efeito para buscar os dados quando o drawer abre
  useEffect(() => {
    if (isOpen) {
      const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends?type=accepted');
            if (response.ok) setFriends(await response.json());
        } catch (error) {
            console.error("Erro ao buscar amigos:", error);
        }
      };

      const fetchRequests = async () => {
        try {
            const response = await fetch('/api/friends?type=requests');
            if (response.ok) setPendingRequests(await response.json());
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        }
      };
      
      fetchFriends();
      fetchRequests();
    }
  }, [isOpen]);

  // Efeito para procurar utilizadores quando o texto da pesquisa muda
  useEffect(() => {
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
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleRespondRequest = async (requesterId: number, status: 'ACCEPTED' | 'DECLINED') => {
      try {
          await fetch('/api/friends', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requesterId, status }),
          });
          
          if (status === 'ACCEPTED') {
            const newFriend = pendingRequests.find(req => req.requester.id === requesterId)?.requester;
            if(newFriend) setFriends([...friends, newFriend]);
          }
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
        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
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
            <button onClick={() => router.push('/interest')} className="flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-[#413c72] hover:text-white transition">
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
          
          <div className="flex-grow flex flex-col gap-4 overflow-y-auto custom-scrollbar -mr-4 pr-4">
            {/* Seção Lista de Amigos */}
            <div className="border-t border-[#4a447a] pt-4 flex flex-col">
              <h2 className="text-sm font-semibold text-[#C9C6FF] mb-2 flex items-center gap-2">
                <User size={16} /> Amigos
              </h2>
              <div className="flex flex-col gap-2">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <div key={friend.id} className="flex items-center bg-[#413c72] px-3 py-2 rounded-xl text-white shadow-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                      <span className="text-sm font-medium truncate">{friend.name}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-center text-gray-400 italic">Você ainda não tem amigos.</span>
                )}
              </div>
            </div>

            {/* Seção de Convites de amizade */}
            <div className="border-t border-[#4a447a] pt-4 flex flex-col">
              <h2 className="text-sm font-semibold text-[#C9C6FF] mb-2">Convites de amizade</h2>
              <div className="flex flex-col gap-3">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <div key={request.requester.id} className="flex items-center justify-between bg-[#413c72] px-3 py-2 rounded-xl text-white shadow">
                      <span className="text-sm font-medium truncate">{request.requester.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col items-center gap-4 text-[#C9C6FF] pt-4 border-t border-[#4a447a]">
          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-white hover:underline transition text-sm">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          <div className="flex items-center gap-2 bg-[#413c72] px-4 py-2 rounded-full shadow-inner">
            <User className="w-5 h-5 text-white" />
            {/* CORREÇÃO AQUI: Usa a prop 'userName' */}
            <span className="text-sm font-semibold text-white">{userName || 'Utilizador'}</span>
          </div>
        </div>
      </div>
      
      {/* Botão do sino (flutuante) */}
      {!isOpen && (
        <button
          onClick={onClose} 
          aria-label="Abrir menu"
          className="fixed top-10 left-10 z-40 bg-[#2f2a51] p-3 rounded-2xl shadow-xl border border-[#7471D9] hover:scale-105 transition-transform duration-200"
        >
          <img src="/sino.png" alt="Abrir menu" className="w-7 h-7" />
        </button>
       )}

      {/* Modal Procurar Amigo */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-[#2f2a51] w-full max-w-md p-6 rounded-xl shadow-2xl border border-[#7471D9]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-bold">Procurar amigo</h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-white text-xl hover:text-red-400"
              >
                <X size={24}/>
              </button>
            </div>
            <input
              type="text"
              placeholder="Digite o nome do utilizador..."
              value={pesquisaModal}
              onChange={(e) => setPesquisaModal(e.target.value)}
              className="w-full bg-[#1f1f3d] text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#7471D9] placeholder:text-[#aaa]"
            />
            {statusMessage && <p className="text-center text-sm my-2" style={{color: statusMessage.includes("sucesso") ? 'lightgreen' : 'lightcoral'}}>{statusMessage}</p>}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {pesquisaModal.length > 2 && searchedUsers.length > 0 ? (
                searchedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-[#413c72] text-white px-4 py-2 rounded-lg flex justify-between items-center"
                  >
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
