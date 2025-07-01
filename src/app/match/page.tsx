'use client';

import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X as CloseIcon, Check, Swords, Users, Info } from "lucide-react";
import MatchModal from "@/components/MatchModal";
import MovieInfoModal from "@/components/MovieInfoModal";
import Drawer from "@/components/DrawerLateral";
import { useSession } from "next-auth/react";

interface Movie { id: number; title: string; year: number; poster: string; overview: string; originalId?: number; }
interface Friend { id: number; name: string | null; }
interface MatchSession { id: number; movies: Movie[]; currentMovieIndex: number; }

const FadedCard = ({ position }: { position: 'left' | 'right' }) => (
  <div className={`absolute top-1/2 -translate-y-1/2 w-56 h-[420px] rounded-2xl bg-white/5 transform-gpu blur-md ${position === 'left' ? '-left-20 -rotate-12' : '-right-20 rotate-12'}`}></div>
);

const FALLBACK_IMAGE_URL = '/placeholder-poster.jpg';

export default function MatchPage() {
  const { status, data: session } = useSession({ required: true });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [matchSession, setMatchSession] = useState<MatchSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);
  const [movieInfoModal, setMovieInfoModal] = useState<Movie | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends?type=accepted');
        if (response.ok) setFriends(await response.json());
      } catch (err) { console.error("Erro ao buscar amigos:", err); }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!matchSession || matchedMovie) return;
    const intervalId = setInterval(async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(`/api/match/${matchSession.id}/status`);
        const data = await response.json();
        if (data.status === 'COMPLETED' && data.movie) {
          const adaptedMovie: Movie = {
            id: data.movie.id,
            title: data.movie.name,
            poster: data.movie.imageUrl || FALLBACK_IMAGE_URL,
            year: 0,
            overview: "Descrição não disponível.",
          };
          setMatchedMovie(adaptedMovie);
        }
      } catch (error) { console.error("Erro no polling:", error); }
    }, 2000);
    if (matchedMovie) clearInterval(intervalId);
    return () => clearInterval(intervalId);
  }, [matchSession, matchedMovie]);

  const handleSelectFriend = async (friend: Friend) => {
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null); setMatchSession(null); return;
    }
    setSelectedFriend(friend); setIsLoading(true); setError(null);
    try {
      const startResponse = await fetch('/api/match/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendIds: [friend.id] }),
      });
      const { sessionId, status: sessionStatus } = await startResponse.json();
      if (!sessionId) throw new Error("Não foi possível obter a sessão de match.");
      if (sessionStatus === 'PENDING') {
        setMatchSession({ id: sessionId, movies: [], currentMovieIndex: 0 });
        return;
      }
      const moviesResponse = await fetch(`/api/match/${sessionId}`);
      if (!moviesResponse.ok) throw new Error("Falha ao carregar os filmes da sessão.");
      const moviesData = await moviesResponse.json();
      
      const adaptedMovies: Movie[] = moviesData.map((movie: any) => ({
        id: movie.id, // Este é o ID do TMDB para usar no modal
        title: movie.name || "Título Desconhecido",
        year: movie.year ? parseInt(movie.year, 10) : 0,
        poster: movie.imageUrl || FALLBACK_IMAGE_URL,
        overview: "Descrição não disponível.",
        originalId: movie.originalId, // ID do banco para usar nos votos
      }));
      setMatchSession({ id: sessionId, movies: adaptedMovies, currentMovieIndex: 0 });
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro."); setMatchSession(null);
    } finally { setIsLoading(false); }
  };

  const handleSwipe = useCallback(
    async (direction: "left" | "right") => {
      if (!matchSession || swipeDirection) return;
      const movieOnTop = matchSession.movies[matchSession.currentMovieIndex];
      if (!movieOnTop) return;
      const action = direction === 'right' ? 'ACCEPTED' : 'DECLINED';
      setSwipeDirection(direction);
      try {
        await fetch(`/api/match/${matchSession.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interestId: movieOnTop.originalId || movieOnTop.id, action }),
        });
      } catch (err) { console.error("Erro ao enviar voto:", err); }
    },
    [matchSession, swipeDirection]
  );

  const handleCloseMatchModal = () => {
    setMatchedMovie(null); setMatchSession(null); setSelectedFriend(null);
  };

  const handleShowMovieInfo = () => {
    if (matchSession && matchSession.movies.length > 0) {
      const currentMovie = matchSession.movies[matchSession.currentMovieIndex];
      setMovieInfoModal(currentMovie);
    }
  };

  const handleCloseMovieInfoModal = () => {
    setMovieInfoModal(null);
  };

  const handleMarkAsWatched = async (movieId: number) => {
    try {
      const response = await fetch(`/api/interests/${movieId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Filme marcado como assistido e removido dos interesses');
        // Opcionalmente, você pode atualizar o estado local aqui
        // Por exemplo, remover o filme da lista de filmes em comum se necessário
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao remover filme dos interesses:', errorData.error);
        throw new Error(errorData.error || 'Erro ao remover filme');
      }
    } catch (error) {
      console.error('❌ Erro ao remover filme dos interesses:', error);
      throw error; // Re-throw para que o MatchModal possa capturar o erro
    }
  };

  const handleDragEnd = (_e: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) handleSwipe("right");
    else if (info.offset.x < -threshold) handleSwipe("left");
    else x.set(0);
  };

  const truncateTitle = (title: string, maxLength: number): string =>
    title.length > maxLength ? `${title.substring(0, maxLength).trim()}...` : title;

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0e0e13] text-white">
        A carregar...
      </div>
    );
  }

  const currentIndex = matchSession?.currentMovieIndex ?? 0;
  const canSwipe =
    !isLoading &&
    !error &&
    matchSession &&
    matchSession.movies.length > 0 &&
    currentIndex < matchSession.movies.length &&
    !matchedMovie;

  return (
    <div className="flex w-full min-h-screen bg-[#0e0e13] font-sans text-[#7471D9]">
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} userName={session?.user?.name || ''} />
      <main className={`flex-grow transition-all duration-300 ${isDrawerOpen ? "lg:ml-[272px]" : "ml-0"}`}>
        <div className="p- md:p-8 w-full h-full">
          {!isDrawerOpen && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="fixed top-10 left-10 z-50 bg-[#2f2a51] p-3 rounded-2xl shadow-lg border border-[#7471D9] hover:scale-105 transition-transform duration-200"
              aria-label="Abrir menu"
            >
              <img src="/sino.png" alt="Abrir menu" className="w-8 h-8" />
            </button>
          )}
          <MatchModal movie={matchedMovie} friendName={selectedFriend?.name || null} onClose={handleCloseMatchModal} onMarkAsWatched={handleMarkAsWatched} />
          <MovieInfoModal movie={movieInfoModal} onClose={handleCloseMovieInfoModal} />
          <div className="bg-[#1F1F26] rounded-2xl w-full p-6 md:p-8 flex flex-col min-h-full">
            <header className="text-center">
              <div className="flex justify-center items-center gap-3 mb-2">
                <Swords className="w-12 h-12 text-[#A8A4F8]" />
                <h1 className="text-center md:text-5xl lg:text-6xl font-bold mb-2 text-white">
                  Invite someone to your <span className="text-[#A8A4F8]">YouVerse</span>
                </h1>
              </div>
              <p className="text-md text-[#82829c]">Selecione um amigo para começar um Match!</p>
            </header>
            <div className="flex-1 flex flex-col md:flex-row gap-8 items-center justify-center mt-2">
              <aside className="w-full md:w-64 flex-shrink-0">
              <div className="mb-4">
                <div className="relative -top-25 left-0">
                <Input
                  placeholder="Search in your friend list..."
                  className="pl-5 pr-12 h-10 bg-[#282845] text-white placeholder-gray-400 border border-[#3b3b5c] rounded-xl focus:ring-2 focus:ring-[#7471D9] focus:border-[#7471D9]"
                />
                <Search className="absolute top-1/2 right-4 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="relative -top-25 flex flex-row md:flex-col gap-3 justify-center">
                {friends.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleSelectFriend(f)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-[#303054] transition-all duration-200 ${
                  selectedFriend?.id === f.id
                    ? "bg-[#7471D9] text-white font-semibold"
                    : "bg-[#282845]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span className="truncate hidden md:inline">{f.name}</span>
                </div>
                ))}
              </div>
              </aside>
              <div className="flex-1 flex items-center justify-center w-full -ml-65">
                <div className="relative w-full max-w-xs h-[464px] flex items-center justify-center">
                  <FadedCard position="left" />
                  <FadedCard position="right" />
                  <div className="absolute w-64 h-full z-no">
                    {isLoading ? (
                      <div className="w-full h-full flex items-center justify-center text-xl text-[#A8A4F8]">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        A carregar...
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">{error}</div>
                    ) : matchSession && matchSession.movies.length === 0 && selectedFriend ? (
                      <div className="text-center text-[#A8A4F8] flex flex-col items-center justify-center gap-4 h-full">
                        <p className="text-xl mt-4">
                          Convite enviado! A aguardar que {selectedFriend?.name} aceite.
                        </p>
                      </div>
                    ) : canSwipe ? (
                      <motion.div
                        key={matchSession.movies[currentIndex].id}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        style={{ x, zIndex: 40, width: '100%', height: '100%' }}
                        animate={
                          swipeDirection
                            ? { x: swipeDirection === "left" ? -300 : 300, opacity: 0 }
                            : { x: 0, opacity: 1 }
                        }
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        onAnimationComplete={() => {
                          if (swipeDirection) {
                            setMatchSession((prev) =>
                              prev
                                ? { ...prev, currentMovieIndex: prev.currentMovieIndex + 1 }
                                : null
                            );
                            setSwipeDirection(null); x.set(0);
                          }
                        }}
                      >
                        <Card className="mt-6 w-full h-full overflow-hidden flex flex-col bg-black border-none shadow-xl shadow-black/40 rounded-3xl relative">
                          <div className="w-full h-full">
                            <img
                              src={matchSession.movies[currentIndex].poster}
                              alt={`Pôster do filme ${matchSession.movies[currentIndex].title}`}
                              className="absolute inset-0 w-full h-113 object-cover rounded-xl transition-opacity duration-800 ease-in-out"
                            />
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black via-black/50 to-transparent transition-all duration-700 ease-in-out" />
                          </div>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 z-20">
                            <button
                              onClick={() => handleSwipe("left")}
                              className="w-14 h-14 rounded-full bg-red-600/80 backdrop-blur-md hover:bg-red-600 hover:scale-130 transition-all flex items-center justify-center border-2 border-white/10 shadow-md"
                            >
                              <CloseIcon className="w-6 h-6 text-white" />
                            </button>
                            <button
                              onClick={handleShowMovieInfo}
                              className="mt-3 w-11 h-11 rounded-full bg-gray-500/30 backdrop-blur-md hover:bg-gray-500/60 hover:scale-110 transition-all flex items-center justify-center border-2 border-white/10 shadow-md"
                              aria-label="Mais informações"
                            >
                              <Info className="w-5 h-5 text-white" />
                            </button>
                            <button
                              onClick={() => handleSwipe("right")}
                              className="w-14 h-14 rounded-full bg-green-500/80 backdrop-blur-md hover:bg-green-500 hover:scale-130 transition-all flex items-center justify-center border-2 border-white/10 shadow-md"
                            >
                              <Check className="w-6 h-6 text-white" />
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ) : (
                      <div className="text-center text-[#A8A4F8] flex flex-col items-center justify-center gap-4 h-full">
                        <Users className="w-16 h-16 text-[#7471D9]" />
                        <p className="text-xl mt-4">
                          {selectedFriend
                            ? "Fim dos filmes em comum!"
                            : "Selecione um amigo para começar!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
