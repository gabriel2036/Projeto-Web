'use client';

import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X as CloseIcon, Check, Film } from "lucide-react";
import MatchModal from "@/components/MatchModal"; // Importe o novo componente

// Interfaces para os dados
interface Movie {
  id: number;
  title: string;
  year: number;
  poster: string;
  overview: string; // Adicionada a sinopse
}

interface Friend {
  id: string;
  name: string | null;
}

interface MatchSession {
  movies: Movie[];
  currentMovieIndex: number;
}

export default function YouVersePage() {
  // --- ESTADOS ---
  const [search, setSearch] = useState("");
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [matchSession, setMatchSession] = useState<MatchSession | null>(null);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  
  // Estado para controlar os filmes curtidos por cada usuário na sessão atual
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [friendLikes, setFriendLikes] = useState<Set<number>>(new Set());

  // Estado para o modal de match
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);

  const x = useMotionValue(0);

  // --- FUNÇÕES E EFEITOS ---
  const truncateTitle = (title: string, maxLength: number): string => {
    return title.length > maxLength ? `${title.substring(0, maxLength).trim()}...` : title;
  };

  useEffect(() => {
    const mockFriends: Friend[] = [ { id: "1", name: "Alice" }, { id: "2", name: "Bruno" }, { id: "3", name: "Carla" }];
    setFriends(mockFriends);
  }, []);
  
  const handleSelectFriend = async (friend: Friend) => {
    if (selectedFriend?.id === friend.id) {
        setSelectedFriend(null);
        setMatchSession(null);
        return;
    }
    setSelectedFriend(friend);
    setIsLoadingMovies(true);
    setUserLikes(new Set()); // Limpa os likes da sessão anterior
    
    // Simula que o amigo já curtiu alguns filmes para podermos ter um match
    setFriendLikes(new Set([13, 27205])); // IDs de "Forrest Gump" e "The Dark Knight"

    try {
      const movieTitlesToFetch = ["Inception", "The Matrix", "Interstellar", "Parasite", "The Dark Knight", "Forrest Gump"];
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
    if (!matchSession) return;
    const movie = matchSession.movies[matchSession.currentMovieIndex];

    if (direction === "right" && movie) {
      const newLikes = new Set(userLikes).add(movie.id);
      setUserLikes(newLikes);

      // <<< LÓGICA DE VERIFICAÇÃO DE MATCH >>>
      if (friendLikes.has(movie.id)) {
        setMatchedMovie(movie); // Deu match! Ativa o modal.
      }
    }
    
    setSwipeDirection(direction);
  }, [matchSession, userLikes, friendLikes]);
  
  const handleDragEnd = (_e: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) handleSwipe("right");
    else if (info.offset.x < -threshold) handleSwipe("left");
    else x.set(0);
  };
  
  const currentIndex = matchSession?.currentMovieIndex ?? 0;

  // --- RENDERIZAÇÃO (JSX) ---
  return (
    <>
      <MatchModal 
        movie={matchedMovie}
        friendName={selectedFriend?.name}
        onClose={() => setMatchedMovie(null)}
      />

      <div className="min-h-screen bg-[#0e0e13] text-white font-sans overflow-x-hidden relative p-4 md:p-6">
        <div className="bg-[#1F1F26] rounded-[36px] w-full max-w-6xl mx-auto p-6 md:p-8 relative shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A8A4F8]">
              Let’s Match <span className="text-white">YouVerses</span>
            </h1>
            <p className="text-lg text-[#82829c] mt-2">
              Choose a friend and swipe through movie matches!
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
            <aside className="w-full md:w-64">
              {/* ...código da lista de amigos não muda... */}
               <div className="relative mb-4">
                <Input
                  placeholder="Search in your friend list..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 bg-[#282845] text-white placeholder-gray-400 border-none rounded-xl focus:ring-2 focus:ring-[#7471D9]"
                />
                <Search className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="flex flex-col gap-3">
                {friends
                  .filter((f) => f.name?.toLowerCase().includes(search.toLowerCase()))
                  .map((f) => (
                    <div
                      key={f.id}
                      onClick={() => handleSelectFriend(f)}
                      className={`flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer hover:bg-[#303054] transition-all duration-200 ${
                        selectedFriend?.id === f.id ? "bg-[#7471D9] text-white font-semibold" : "bg-[#282845]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-400 flex-shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
              </div>
            </aside>

            <div className="flex-1 w-full flex items-center justify-center relative min-h-[450px] md:min-h-[400px]">
              {isLoadingMovies ? (
                  <div className="text-xl text-[#A8A4F8] flex items-center gap-3"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>Buscando filmes...</div>
              ) : selectedFriend && matchSession && matchSession.movies.length > 0 && currentIndex < matchSession.movies.length ? (
                  <div className="relative w-64 h-96">
                    {matchSession.movies.slice(currentIndex, currentIndex + 3).reverse().map((movie, i) => {
                      const isTop = i === matchSession.movies.slice(currentIndex, currentIndex + 3).length - 1;
                      return (
                        <motion.div
                          key={movie.id}
                          drag={isTop ? "x" : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragEnd={handleDragEnd}
                          style={{ 
                            x: isTop ? x : 0, 
                            scale: isTop ? 1 : 1 - (matchSession.movies.slice(currentIndex, currentIndex + 3).length - 1 - i) * 0.05,
                            zIndex: 50 - i * 10,
                            position: 'absolute', width: '100%', height: '100%',
                            transformOrigin: 'bottom center',
                          }}
                          animate={
                            isTop && swipeDirection ? { x: swipeDirection === "left" ? -500 : 500, opacity: 0 } : { x: 0, opacity: 1 }
                          }
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          onAnimationComplete={() => {
                            if (isTop && swipeDirection) {
                              setMatchSession(prev => prev ? ({...prev, currentMovieIndex: prev.currentMovieIndex + 1}) : null);
                              setSwipeDirection(null);
                              x.set(0);
                            }
                          }}
                        >
                          <Card className="w-full h-full overflow-hidden flex flex-col bg-[#2a2a3e] border-2 border-transparent hover:border-[#7471D9] transition-all duration-300 shadow-xl shadow-black/30">
                            <div className="h-4/5">
                              <img src={movie.poster} alt={`Pôster do filme ${movie.title}`} className="object-cover w-full h-full"/>
                            </div>
                            <div className="h-1/5 bg-[#1A1A2B] flex flex-col justify-center items-center text-center p-2">
                              <h2 className="text-base font-semibold text-white leading-tight">
                                {truncateTitle(movie.title, 35)}
                              </h2>
                              <span className="text-sm text-gray-400 mt-1">{movie.year}</span>
                            </div>
                          </Card>
                          {isTop && (
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-6">
                              <button onClick={() => handleSwipe("left")} className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:scale-110 active:scale-100 transition-transform duration-200 shadow-lg shadow-red-900/50 flex items-center justify-center border-2 border-white/20"><CloseIcon className="w-6 h-6 text-white" /></button>
                              <button onClick={() => handleSwipe("right")} className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:scale-110 active:scale-100 transition-transform duration-200 shadow-lg shadow-green-900/50 flex items-center justify-center border-2 border-white/20"><Check className="w-6 h-6 text-white" /></button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
              ) : selectedFriend ? (
                  <div className="text-center text-[#A8A4F8] flex flex-col items-center justify-center gap-4">
                      <Film className="w-16 h-16 text-[#7471D9]"/>
                      <p className="text-xl mt-4">Fim dos filmes para este match!</p>
                  </div>
              ) : (
                  <div className="text-center text-[#A8A4F8] flex flex-col items-center justify-center gap-4">
                      <div className="text-6xl">👥</div>
                      <p className="text-xl">Selecione um amigo para começar!</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
