'use client';

import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X as CloseIcon, Check, Swords, Users } from "lucide-react";
import MatchModal from "@/components/MatchModal";

// --- Interfaces ---
interface Movie {
  id: number;
  title: string;
  year: number;
  poster: string;
  overview: string;
}

interface Friend {
  id: string;
  name: string | null;
}

interface MatchSession {
  movies: Movie[];
  currentMovieIndex: number;
}

// --- Componente para o Card Decorativo ---
const FadedCard = ({ position }: { position: 'left' | 'right' }) => (
    <div 
      className={`absolute top-1/2 -translate-y-1/2 w-56 h-[420px] rounded-2xl bg-white/5 transform-gpu blur-md
      ${position === 'left' ? '-left-20 -rotate-12' : '-right-20 rotate-12'}`}
    ></div>
);

export default function MatchPage() {
  // --- Estados ---
  const [search, setSearch] = useState("");
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [matchSession, setMatchSession] = useState<MatchSession | null>(null);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [friendLikes, setFriendLikes] = useState<Set<number>>(new Set());
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);
  const x = useMotionValue(0);

  // --- Funções e Efeitos ---
  const truncateTitle = (title: string, maxLength: number): string => {
    return title.length > maxLength ? `${title.substring(0, maxLength).trim()}...` : title;
  };

  useEffect(() => {
    const mockFriends: Friend[] = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bruno" },
      { id: "3", name: "Carla" },
      { id: "4", name: "Daniela" },
    ];
    setFriends(mockFriends);
  }, []);

  const handleSelectFriend = async (friend: Friend) => {
    if (selectedFriend?.id === friend.id) {
        setSelectedFriend(null); setMatchSession(null); return;
    }
    setSelectedFriend(friend);
    setIsLoadingMovies(true);
    setUserLikes(new Set());
    setFriendLikes(new Set([27205, 13]));

    try {
      const movieTitlesToFetch = ["Inception", "The Matrix", "Interstellar", "10 Things I Hate About You", "The Dark Knight", "Forrest Gump"];
      const moviePromises = movieTitlesToFetch.map(title =>
        fetch(`/api/movies/search?query=${encodeURIComponent(title)}`).then(res => res.ok ? res.json() : null)
      );
      const fetchedMovies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[];
      setMatchSession({ movies: fetchedMovies, currentMovieIndex: 0 });
    } catch (err) {
      console.error("Erro ao iniciar sessão de match:", err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (!matchSession || swipeDirection) return;
    const movieOnTop = matchSession.movies[matchSession.currentMovieIndex];

    if (direction === "right" && movieOnTop) {
      const newLikes = new Set(userLikes).add(movieOnTop.id);
      setUserLikes(newLikes);
      if (friendLikes.has(movieOnTop.id)) {
        setMatchedMovie(movieOnTop);
      }
    }
    setSwipeDirection(direction);
  }, [matchSession, userLikes, friendLikes, swipeDirection]);

  const handleDragEnd = (_e: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) handleSwipe("right");
    else if (info.offset.x < -threshold) handleSwipe("left");
    else x.set(0);
  };

  const currentIndex = matchSession?.currentMovieIndex ?? 0;
  const canSwipe = selectedFriend && matchSession && currentIndex < matchSession.movies.length;

  return (
    <>
      <MatchModal movie={matchedMovie} friendName={selectedFriend?.name} onClose={() => setMatchedMovie(null)} />
      
      <div className="bg-[#1F1F26] rounded-2xl w-full p-6 md:p-8 flex flex-col h-full">
        {/* Cabeçalho e Busca */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-2">
              <Swords className="w-8 h-8 text-[#A8A4F8]" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Invite someone to your <span className="text-[#A8A4F8]">YouVerse</span>.
              </h1>
          </div>
          <p className="text-md text-[#82829c]">
            You can see your friends here!
          </p>
          <div className="max-w-md mx-auto mt-6">
            <div className="relative">
              <Input placeholder="Search in your friend list..." className="pl-5 pr-12 h-12 bg-[#282845] text-white placeholder-gray-400 border-2 border-transparent rounded-full focus:ring-2 focus:ring-[#7471D9] focus:border-[#7471D9]" />
              <Search className="absolute top-1/2 right-5 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col md:flex-row gap-8 items-center justify-center mt-6">
          {/* Lista de Amigos */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="flex flex-row md:flex-col gap-3 justify-center">
              {friends.map((f) => (
                <div key={f.id} onClick={() => handleSelectFriend(f)} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-[#303054] transition-all duration-200 ${selectedFriend?.id === f.id ? "bg-[#7471D9] text-white font-semibold" : "bg-[#282845]"}`}>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span className="truncate hidden md:inline">{f.name}</span>
                </div>
              ))}
            </div>
          </aside>
          
          {/* Área do Carrossel */}
          <div className="flex-1 flex items-center justify-center w-full">
            {/* <<< O CONTAINER PRINCIPAL FOI CORRIGIDO AQUI >>> */}
            <div className="relative w-full max-w-xs h-[464px] flex items-center justify-center">
                <FadedCard position="left" />
                <FadedCard position="right" />
                
                {/* <<< O CONTAINER DO CARD INTERATIVO FOI CORRIGIDO AQUI >>> */}
                <div className="absolute w-64 h-full z-10">
                    {isLoadingMovies ? (
                        <div className="w-full h-full flex items-center justify-center text-xl text-[#A8A4F8]"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>Loading...</div>
                    ) : canSwipe ? (
                        <motion.div
                          key={matchSession.movies[currentIndex].id}
                          drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd}
                          style={{ x, zIndex: 40, width: '100%', height: '100%' }}
                          animate={ swipeDirection ? { x: swipeDirection === "left" ? -300 : 300, opacity: 0 } : { x: 0, opacity: 1 } }
                          transition={{ type: "spring", stiffness: 400, damping: 40 }}
                          onAnimationComplete={() => {
                            if (swipeDirection) {
                              setMatchSession(prev => prev ? ({...prev, currentMovieIndex: prev.currentMovieIndex + 1}) : null);
                              setSwipeDirection(null); x.set(0);
                            }
                          }}
                        >
                            {/* <<< O CARD EM SI FOI CORRIGIDO AQUI >>> */}
                            <Card className="w-full h-full overflow-hidden flex flex-col bg-[#2a2a3e] border-2 border-transparent shadow-2xl shadow-black/50 rounded-2xl">
                                {/* Flex-grow faz a imagem ocupar o espaço disponível */}
                                <div className="flex-grow relative">
                                    <img src={matchSession.movies[currentIndex].poster} alt={`Pôster do filme ${matchSession.movies[currentIndex].title}`} className="absolute inset-0 w-full h-full object-cover"/>
                                    {/* Botões sobre a imagem */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6">
                                        <button onClick={() => handleSwipe("left")} className="w-14 h-14 rounded-full bg-red-600/80 backdrop-blur-sm hover:bg-red-600 hover:scale-110 transition-all flex items-center justify-center border-2 border-white/20"><CloseIcon className="w-6 h-6 text-white" /></button>
                                        <button onClick={() => handleSwipe("right")} className="w-14 h-14 rounded-full bg-green-500/80 backdrop-blur-sm hover:bg-green-500 hover:scale-110 transition-all flex items-center justify-center border-2 border-white/20"><Check className="w-6 h-6 text-white" /></button>
                                    </div>
                                </div>
                                {/* Área de texto com altura fixa */}
                                <div className="h-[84px] flex-shrink-0 bg-[#1A1A2B] flex flex-col justify-center items-center text-center p-2">
                                    <h2 className="text-base font-semibold text-white leading-tight">{truncateTitle(matchSession.movies[currentIndex].title, 35)}</h2>
                                    <span className="text-sm text-gray-400 mt-1">{matchSession.movies[currentIndex].year}</span>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="text-center text-[#A8A4F8] flex flex-col items-center justify-center gap-4 h-full">
                            <Users className="w-16 h-16 text-[#7471D9]"/>
                            <p className="text-xl mt-4">{selectedFriend ? "Fim dos filmes!" : "Selecione um amigo!"}</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
